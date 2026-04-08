import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Link } from "@inertiajs/react";

export default function Create({ products }) {
    const { auth } = usePage().props;
    const permissions = auth?.user?.permissions || [];
    const can = (permission) => permissions.includes(permission);

    const [items, setItems] = useState([
        { product_id: "", quantity: 1, unit_price: 0 },
    ]);
    const [selectedProducts, setSelectedProducts] = useState({});

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: "",
        customer_phone: "",
        payment_method: "cash",
        items: [],
        total_amount: 0,
    });

    // Add new item row
    const addItem = () =>
        setItems([...items, { product_id: "", quantity: 1, unit_price: 0 }]);

    // Remove item row
    const removeItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(
            newItems.length
                ? newItems
                : [{ product_id: "", quantity: 1, unit_price: 0 }],
        );
    };

    // Update item field + auto-fill price
    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (field === "product_id" && value) {
            const product = products.find((p) => p.id == value);
            if (product) {
                newItems[index].unit_price = parseFloat(
                    product.unit_sell_price,
                );
                setSelectedProducts((prev) => ({ ...prev, [index]: product }));
            }
        }

        setItems(newItems);
    };

    // Calculate subtotal for an item
    const calculateSubtotal = (item) =>
        (item.quantity * item.unit_price).toFixed(2);

    // Calculate grand total
    const calculateTotal = () =>
        items
            .reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
            .toFixed(2);

    // Submit sale
    const submit = (e) => {
        e.preventDefault();

        // Prepare items for submission
        const saleItems = items
            .filter((item) => item.product_id && item.quantity > 0)
            .map((item) => ({
                product_id: Number(item.product_id),
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
            }));

        if (!saleItems.length) {
            alert(
                "⚠️ Please add at least one item with a selected product and quantity > 0",
            );
            return;
        }
        // Post to backend

        post(
            route("sales.store"),
            {
                customer_name: data.customer_name,
                customer_phone: data.customer_phone,
                payment_method: data.payment_method,
                items: saleItems,
                total_amount: Number(
                    saleItems.reduce(
                        (sum, i) => sum + i.quantity * i.unit_price,
                        0,
                    ),
                ),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setItems([{ product_id: "", quantity: 1, unit_price: 0 }]);
                    setSelectedProducts({});
                    alert("✅ Sale created successfully!");
                },
                onError: (errors) => {
                    console.error(errors);
                    alert(
                        "❌ Failed to create sale: " +
                            Object.values(errors).flat().join(", "),
                    );
                },
            },
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        New Sale
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Create a new sales transaction
                    </p>
                </div>

                {/* Form Card */}
                <form
                    onSubmit={submit}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    {/* Customer Info */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Customer Information
                        </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                placeholder="Add your name"
                                value={data.customer_name}
                                onChange={(e) =>
                                    setData("customer_name", e.target.value)
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            {errors.customer_name && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.customer_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                placeholder="Phone number"
                                value={data.customer_phone}
                                onChange={(e) =>
                                    setData("customer_phone", e.target.value)
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Method *
                            </label>
                            <select
                                value={data.payment_method}
                                onChange={(e) =>
                                    setData("payment_method", e.target.value)
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="cash">💵 Cash</option>
                                <option value="cbe">🏦 CBE</option>
                                <option value="other_bank">
                                    🏦 Other Bank
                                </option>
                                <option value="telebirr">📱 Tele Birr</option>
                            </select>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Items
                        </h2>
                        <button
                            type="button"
                            onClick={addItem}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Add Item
                        </button>
                    </div>

                    <div className="p-6">
                        {items.map((item, index) => {
                            const product = selectedProducts[index];
                            const availableStock =
                                product?.current_quantity || 0;

                            return (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="font-medium text-gray-800">
                                            Item #{index + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                                            title="Delete this item"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {/* Product Select */}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Product *
                                            </label>
                                            <select
                                                value={item.product_id}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "product_id",
                                                        e.target.value,
                                                    )
                                                }
                                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    !item.product_id
                                                        ? "border-red-400 bg-red-50"
                                                        : "border-gray-300"
                                                }`}
                                                required
                                            >
                                                <option value="">
                                                    ⚠️ Select a product...
                                                </option>
                                                {products.map((p) => (
                                                    <option
                                                        key={p.id}
                                                        value={p.id}
                                                        disabled={
                                                            p.current_quantity <=
                                                            0
                                                        }
                                                    >
                                                        {p.name} (
                                                        {p.current_quantity} in
                                                        stock) - Br{" "}
                                                        {p.unit_sell_price}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors[
                                                `items.${index}.product_id`
                                            ] && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {
                                                        errors[
                                                            `items.${index}.product_id`
                                                        ]
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* Quantity */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Quantity *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max={availableStock || 999}
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "quantity",
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 1,
                                                    )
                                                }
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                            {availableStock > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {availableStock} available
                                                </p>
                                            )}
                                        </div>

                                        {/* Unit Price */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Price (Br) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.unit_price}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "unit_price",
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="mt-3 text-right">
                                        <span className="text-sm text-gray-600">
                                            Subtotal:{" "}
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            Br {calculateSubtotal(item)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Total & Submit */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <span className="text-lg font-semibold text-gray-800">
                                Total Amount:{" "}
                            </span>
                            <span className="text-2xl font-bold text-green-600">
                                Br {calculateTotal()}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href={route("sales.index")}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    items.every((i) => !i.product_id)
                                }
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                            >
                                {processing ? "Processing..." : "Complete Sale"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
