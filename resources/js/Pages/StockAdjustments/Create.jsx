import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from "../../Layouts/AuthenticatedLayout";

export default function Create() {
    const { products, categories } = usePage().props;

    const [error, setError] = useState("");

    const { data, setData, post, processing, reset } = useForm({
        category_id: "",
        product_id: "",
        type: "",
        quantity: "",
        note: "",
    });

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
            onSuccess: () => reset(),
        });
    }

    return (
        <AuthenticatedLayout>
            <div className="p-6 max-w-4xl mx-auto">
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

                        {/* CATEGORY (NEW) */}
                        <select
                            value={data.category_id}
                            onChange={(e) =>
                                setData("category_id", e.target.value)
                            }
                            className="border p-2 rounded-lg"
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {/* PRODUCT (FILTERED) */}
                        <select
                            value={data.product_id}
                            onChange={(e) =>
                                setData("product_id", e.target.value)
                            }
                            className="border p-2 rounded-lg"
                        >
                            <option value="">Select Product</option>
                            {filteredProducts.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} (Stock: {p.current_quantity})
                                </option>
                            ))}
                        </select>

                        {/* TYPE */}
                        <select
                            value={data.type}
                            onChange={(e) =>
                                setData("type", e.target.value)
                            }
                            className="border p-2 rounded-lg"
                        >
                            <option value="">Select Type</option>
                            <option value="increment">Add Stock</option>
                            <option value="decrement">Reduce Stock</option>
                        </select>

                        {/* QUANTITY */}
                        <input
                            type="number"
                            value={data.quantity}
                            onChange={(e) =>
                                setData("quantity", e.target.value)
                            }
                            className="border p-2 rounded-lg"
                            placeholder="Quantity"
                        />

                        {/* NOTE */}
<textarea
    value={data.note}
    onChange={(e) => setData("note", e.target.value)}
    className="border p-2 rounded-lg w-full h-32 overflow-y-auto resize-none"
    placeholder="Note (optional)"
/>
                    </div>

                    <button
                        disabled={processing}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        {processing ? "Saving..." : "Adjust Stock"}
                    </button>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}