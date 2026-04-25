import { useState } from "react";
import { router } from "@inertiajs/react";

export default function Create({ products }) {
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    // Filter products
    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
    );

    // Add to cart
    const addToCart = (product) => {
        const price = Number(product.unit_sell_price || 0);
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
                },
            ];
        });
    };

    const removeItem = (id) => {
        setCart(cart.filter((item) => item.id !== id));
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const submitSale = () => {
        if (cart.length === 0) return alert("Cart is empty!");
        if (!customerName.trim()) return alert("Customer name is required!");

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

    const cancelOrder = () => setCart([]);
    const goBack = () => router.visit(route("sales.index"));

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* TOP BAR (NOT STICKY) */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={goBack}
                        className="px-3 py-1 bg-gray-200 rounded"
                    >
                        ←
                    </button>
                    <h1 className="text-lg font-semibold">New Sale</h1>
                </div>

                <div className="text-sm text-gray-500">
                    {cart.length} items • Br {total.toFixed(2)}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* PRODUCTS */}
                <div className="col-span-8 bg-white p-5 rounded-xl shadow">
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

                {/* BILLING */}
                <div className="col-span-4">
                    <div className="bg-white p-5 rounded-xl shadow sticky top-20 flex flex-col max-h-[calc(100vh-145px)]">
                        <h2 className="font-bold mb-4">Billing</h2>

                        {/* CUSTOMER */}
                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="Customer Name *"
                                className="w-full border p-2 rounded mb-2"
                                value={customerName}
                                onChange={(e) =>
                                    setCustomerName(e.target.value)
                                }
                            />
                            <input
                                type="text"
                                placeholder="Phone"
                                className="w-full border p-2 rounded"
                                value={customerPhone}
                                onChange={(e) =>
                                    setCustomerPhone(e.target.value)
                                }
                            />
                        </div>

                        {/* PAYMENT */}
                        <select
                            className="w-full border p-2 rounded mb-3"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="cash">Cash</option>
                            <option value="cbe">CBE</option>
                            <option value="telebirr">Telebirr</option>
                            <option value="other_bank">Other Bank</option>
                        </select>

                        {/* CART + TOTAL */}
                        <div className="flex flex-col flex-1 min-h-0 border rounded p-2">
                            {/* 🧾 CART LIST */}
                            <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                                {cart.length === 0 ? (
                                    <p className="text-gray-400">
                                        No items added
                                    </p>
                                ) : (
                                    cart.map((item) => (
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
                                                        item.price * item.qty
                                                    ).toFixed(2)}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                    className="text-red-500"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* 💰 TOTAL */}
                            <div className="border-t pt-3 mt-2 shrink-0">
                                <p className="flex justify-between font-bold">
                                    <span>Total:</span>
                                    <span>Br {total.toFixed(2)}</span>
                                </p>
                                {/* ACTIONS (ALWAYS VISIBLE) */}
                                <div className="mt-3 space-y-2 shrink-0">
                                    <button
                                        onClick={submitSale}
                                        className="w-full bg-blue-600 text-white py-2 rounded"
                                    >
                                        Place Order
                                    </button>

                                    <button
                                        onClick={cancelOrder}
                                        className="w-full bg-gray-300 py-2 rounded"
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
