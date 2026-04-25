import { useState } from "react";
import { router } from "@inertiajs/react";

export default function Create({ products }) {
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    // 🔍 Filter products
    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
    );

    // ➕ Add to cart
    const addToCart = (product) => {
        const price = Number(product.unit_sell_price || 0);

        // prevent invalid price
        if (price <= 0) return;

        setCart((prev) => {
            const exist = prev.find((p) => p.id === product.id);

            if (exist) {
                return prev.map((p) =>
                    p.id === product.id ? { ...p, qty: p.qty + 1 } : p,
                );
            }

            return [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    price,
                    qty: 1,
                    stock: product.current_quantity,
                },
            ];
        });
    };

    // Remove item
    const removeItem = (id) => {
        setCart(cart.filter((item) => item.id !== id));
    };

    // Safer total calculation
    const total = cart.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
        0,
    );

    // Submit sale (CLEAN + FIXED)
    const submitSale = () => {
        if (cart.length === 0) {
            alert("Cart is empty!");
            return;
        }

        if (!customerName.trim()) {
            alert("Customer name is required!");
            return;
        }

        router.post(route("sales.store"), {
            customer_name: customerName,
            customer_phone: customerPhone || null,
            payment_method: paymentMethod,

            items: cart.map((item) => ({
                product_id: item.id,
                quantity: item.qty,
                unit_price: item.price,
            })),
        });
    };

    const cancelOrder = () => {
        setCart([]);
    };
    const goBack = () => {
        router.visit(route("sales.index"));
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="grid grid-cols-12 gap-6">
                {/* 🟦 PRODUCT SECTION */}
                <div className="col-span-8 bg-white p-5 rounded-xl shadow">
                    <h2 className="font-bold mb-4">Product Section</h2>

                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full border p-2 rounded mb-4"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="grid grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="border p-3 rounded cursor-pointer hover:bg-gray-100"
                            >
                                <h3 className="font-semibold">
                                    {product.name}
                                </h3>

                                <p>
                                    Br{" "}
                                    {Number(
                                        product.unit_sell_price || 0,
                                    ).toFixed(2)}
                                </p>

                                <p className="text-xs text-gray-400">
                                    Qty: {product.current_quantity}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🟩 BILLING SECTION */}
                <div className="col-span-4 bg-white p-5 rounded-xl shadow">
                    <h2 className="font-bold mb-4">Billing Section</h2>

                    {/* 👤 CUSTOMER INFO */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Customer Name *"
                            className="w-full border p-2 rounded mb-2"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Customer Phone"
                            className="w-full border p-2 rounded"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                    </div>

                    {/* 💳 PAYMENT */}
                    <select
                        className="w-full border p-2 rounded mb-4"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option value="cash">Cash</option>
                        <option value="cbe">CBE</option>
                        <option value="telebirr">Telebirr</option>
                        <option value="other_bank">Other Bank</option>
                    </select>

                    {/* 🧾 CART */}
                    <div className="mb-4">
                        {cart.length === 0 && (
                            <p className="text-gray-400">No items added</p>
                        )}

                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-center border-b py-2"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {item.qty} × {item.price}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span>
                                        {(
                                            Number(item.price) *
                                            Number(item.qty)
                                        ).toFixed(2)}
                                    </span>

                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-500"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 💰 TOTAL */}
                    <div className="border-t pt-4">
                        <p className="flex justify-between">
                            <span>Total:</span>
                            <span className="font-bold">
                                Br {total.toFixed(2)}
                            </span>
                        </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-6 flex flex-col gap-3">
                        <button
                            onClick={submitSale}
                            className="bg-blue-600 text-white py-2 rounded"
                        >
                            Place Order
                        </button>

                        <button
                            onClick={cancelOrder}
                            className="bg-red-500 text-white py-2 rounded"
                        >
                            Cancel Order
                        </button>
                        {/* 🔙 BACK BUTTON */}
                        <button
                            onClick={goBack}
                            className="mb-4 bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
