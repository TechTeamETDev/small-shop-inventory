import { useForm, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import AuthenticatedLayout from "../../Layouts/AuthenticatedLayout";

export default function Create() {
    const { products, categories, adjustments: initialAdjustments } = usePage().props;

    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [adjustments, setAdjustments] = useState(initialAdjustments);

    const { data, setData, post, processing, reset } = useForm({
        category_id: "",
        product_id: "",
        type: "",
        quantity: "",
        note: "",
    });

    const [editData, setEditData] = useState({
        type: "",
        quantity: "",
        note: "",
    });

    useEffect(() => {
        setAdjustments(initialAdjustments);
    }, [initialAdjustments]);

    const filteredProducts = data.category_id
        ? products.filter(p => p.category_id == data.category_id)
        : products;

    function submit(e) {
        e.preventDefault();
        setError("");

        if (!data.product_id || !data.type || !data.quantity) {
            setError("All fields are required");
            return;
        }

        post("/stock-adjustments", {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    }

    function editAdjustment(item) {
        setEditingId(item.id);
        setEditData({
            type: item.type,
            quantity: item.quantity,
            note: item.note || "",
        });
    }

    function updateAdjustment(id) {
        router.put(`/stock-adjustments/${id}`, editData, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
            },
        });
    }

    function deleteAdjustment(id) {
        if (!confirm("Delete this adjustment?")) return;

        router.delete(`/stock-adjustments/${id}`, {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout>
            <div className="p-6 max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">
                    Stock Adjustment
                </h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="bg-white p-5 rounded-lg shadow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <select
                            value={data.category_id}
                            onChange={(e) => setData("category_id", e.target.value)}
                            className="border p-2 rounded-lg"
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        <select
                            value={data.product_id}
                            onChange={(e) => setData("product_id", e.target.value)}
                            className="border p-2 rounded-lg"
                        >
                            <option value="">Select Product</option>
                            {filteredProducts.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} (Stock: {p.current_quantity})
                                </option>
                            ))}
                        </select>

                        <select
                            value={data.type}
                            onChange={(e) => setData("type", e.target.value)}
                            className="border p-2 rounded-lg"
                        >
                            <option value="">Select Type</option>
                            <option value="increment">Add Stock</option>
                            <option value="decrement">Reduce Stock</option>
                        </select>

                        <input
                            type="number"
                            value={data.quantity}
                            onChange={(e) => setData("quantity", e.target.value)}
                            className="border p-2 rounded-lg"
                            placeholder="Quantity"
                        />

                        <textarea
                            value={data.note}
                            onChange={(e) => setData("note", e.target.value)}
                            className="border p-2 rounded-lg w-full h-32 md:col-span-2"
                            placeholder="Note"
                        />
                    </div>

                    <button
                        disabled={processing}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        {processing ? "Saving..." : "Adjust Stock"}
                    </button>
                </form>

                <div className="mt-8 bg-white rounded-lg shadow overflow-x-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold">
                            Stock Adjustment History
                        </h2>
                    </div>

                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Quantity</th>
                                <th className="px-4 py-3 text-left">Note</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {adjustments.map(item => (
                                <tr key={item.id} className="border-b">
                                    <td className="px-4 py-3 font-medium">
                                        {item.product?.name}
                                    </td>

                                    {editingId === item.id ? (
                                        <>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={editData.type}
                                                    onChange={(e) =>
                                                        setEditData({ ...editData, type: e.target.value })
                                                    }
                                                    className="border p-1 rounded"
                                                >
                                                    <option value="increment">Add</option>
                                                    <option value="decrement">Reduce</option>
                                                </select>
                                            </td>

                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={editData.quantity}
                                                    onChange={(e) =>
                                                        setEditData({ ...editData, quantity: e.target.value })
                                                    }
                                                    className="border p-1 rounded"
                                                />
                                            </td>

                                            <td className="px-4 py-3">
                                                <input
                                                    value={editData.note}
                                                    onChange={(e) =>
                                                        setEditData({ ...editData, note: e.target.value })
                                                    }
                                                    className="border p-1 rounded"
                                                />
                                            </td>

                                            <td className="px-4 py-3 text-center space-x-2">
                                                <button
                                                    onClick={() => updateAdjustment(item.id)}
                                                    className="text-green-600"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="text-gray-500"
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3">
                                                {item.type === "increment" ? "Add" : "Reduce"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {item.quantity}
                                            </td>

                                            <td className="px-4 py-3">
                                                {item.note || "-"}
                                            </td>

                                            <td className="px-4 py-3 text-center space-x-2">
                                                <button
                                                    onClick={() => editAdjustment(item)}
                                                    className="text-blue-600"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteAdjustment(item.id)}
                                                    className="text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}

                            {adjustments.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-6 text-gray-500">
                                        No adjustments found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}