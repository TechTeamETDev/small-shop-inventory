import { useForm, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function Index() {
    const { products: initialProducts, categories, auth } = usePage().props;
    const permissions = auth?.user?.permissions || [];
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);

    const can = (permission) => permissions.includes(permission);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        name: "",
        sku: "",
        category_id: "",
        unit_buy_price: "",
        unit_sell_price: "",
        current_quantity: 0,
        min_stock_level: 0,
    });

    // --- Products state including unsaved products
    const [products, setProducts] = useState(() => {
        const unsaved = JSON.parse(
            localStorage.getItem("unsaved_forms") || "{}",
        );
        const localProduct = unsaved.product;
        if (localProduct && localProduct.name) {
            return [localProduct, ...initialProducts];
        }
        return initialProducts;
    });

    // --- Load unsaved product into form if exists
    useEffect(() => {
        const unsaved = JSON.parse(
            localStorage.getItem("unsaved_forms") || "{}",
        );
        if (unsaved.product) {
            setData(unsaved.product);
        }
    }, []);

    // --- Submit (Add or Update)
    function submit(e) {
        e.preventDefault();

        const options = {
            onSuccess: (page) => {
                if (editingId) {
                    // Update local products
                    setProducts((prev) =>
                        prev.map((p) =>
                            p.id === editingId ? { ...p, ...data } : p,
                        ),
                    );
                } else {
                    // Add new product
                    setProducts((prev) => [data, ...prev]);
                }

                reset();
                setEditingId(null);
                // Remove auto-saved data
                const unsaved = JSON.parse(
                    localStorage.getItem("unsaved_forms") || "{}",
                );
                delete unsaved.product;
                localStorage.setItem("unsaved_forms", JSON.stringify(unsaved));
            },
            onError: (errors) => console.error("Failed to save:", errors),
        };

        if (editingId) {
            put(`/products/${editingId}`, options);
        } else {
            post("/products", options);
        }
    }

    // --- Edit
    function editProduct(product) {
        setEditingId(product.id);
        setData({
            name: product.name,
            sku: product.sku,
            category_id: product.category_id || "",
            unit_buy_price: product.unit_buy_price,
            unit_sell_price: product.unit_sell_price,
            current_quantity: product.current_quantity,
            min_stock_level: product.min_stock_level,
        });
    }

    // --- Delete
    function deleteProduct(id) {
        if (!confirm("Delete this product?")) return;
        destroy(`/products/${id}`, {
            onSuccess: () => {
                // Remove from local products array
                setProducts((prev) => prev.filter((p) => p.id !== id));
            },
            onError: (errors) => console.error("Failed to delete:", errors),
        });
    }

    // --- Auto-save form to localStorage
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (data.name) {
                const unsaved = JSON.parse(
                    localStorage.getItem("unsaved_forms") || "{}",
                );
                unsaved.product = data;
                localStorage.setItem("unsaved_forms", JSON.stringify(unsaved));
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [data]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Products</h1>

            {/* Form */}
            {can("create products") && (
                <form
                    onSubmit={submit}
                    className="bg-white p-5 rounded-lg shadow mb-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <input
                            placeholder="Product name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="border rounded-lg p-2"
                        />
                        <input
                            placeholder="SKU"
                            value={data.sku}
                            onChange={(e) => setData("sku", e.target.value)}
                            className="border rounded-lg p-2"
                        />
                        <select
                            value={data.category_id}
                            onChange={(e) =>
                                setData("category_id", e.target.value)
                            }
                            className="border rounded-lg p-2"
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Buy Price (ETB)"
                            value={data.unit_buy_price}
                            onChange={(e) =>
                                setData("unit_buy_price", e.target.value)
                            }
                            className="border rounded-lg p-2"
                        />
                        <input
                            type="number"
                            placeholder="Sell Price (ETB)"
                            value={data.unit_sell_price}
                            onChange={(e) =>
                                setData("unit_sell_price", e.target.value)
                            }
                            className="border rounded-lg p-2"
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={data.current_quantity}
                            onChange={(e) =>
                                setData("current_quantity", e.target.value)
                            }
                            className="border rounded-lg p-2"
                        />
                        <input
                            type="number"
                            placeholder="Min Stock"
                            value={data.min_stock_level}
                            onChange={(e) =>
                                setData("min_stock_level", e.target.value)
                            }
                            className="border rounded-lg p-2"
                        />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    reset();
                                    setEditingId(null);
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        )}
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            {editingId ? "Update" : "Add Product"}
                        </button>
                    </div>
                </form>
            )}

            {/* Search */}
            <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg p-2 mb-4 w-full"
            />

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-left">Stock</th>
                            <th className="px-4 py-3 text-left">Buy (ETB)</th>
                            <th className="px-4 py-3 text-left">Sell (ETB)</th>
                            {(can("edit products") ||
                                can("delete products")) && (
                                <th className="px-4 py-3 text-center">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {products
                            .filter((p) =>
                                p.name
                                    .toLowerCase()
                                    .includes(search.toLowerCase()),
                            )
                            .map((p, index) => {
                                const lowStock =
                                    p.current_quantity <= p.min_stock_level;
                                return (
                                    <tr
                                        key={p.id || index}
                                        className={`border-b ${lowStock ? "bg-red-50" : ""}`}
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {p.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            {p.category?.name || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {p.current_quantity}
                                            {lowStock && (
                                                <span className="ml-2 text-xs text-red-600">
                                                    ⚠ Low
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {p.unit_buy_price}
                                        </td>
                                        <td className="px-4 py-3 font-semibold">
                                            {p.unit_sell_price}
                                        </td>
                                        {(can("edit products") ||
                                            can("delete products")) && (
                                            <td className="px-4 py-3 text-center space-x-2">
                                                {can("edit products") && (
                                                    <button
                                                        onClick={() =>
                                                            editProduct(p)
                                                        }
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {can("delete products") && (
                                                    <button
                                                        onClick={() =>
                                                            deleteProduct(p.id)
                                                        }
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        {products.filter((p) =>
                            p.name.toLowerCase().includes(search.toLowerCase()),
                        ).length === 0 && (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="px-4 py-8 text-center text-gray-500"
                                >
                                    No products found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
