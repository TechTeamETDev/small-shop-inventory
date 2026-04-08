import { useForm, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function Create({ products }) {
    const { auth } = usePage().props;
    const permissions = auth?.user?.permissions || [];
    const can = (permission) => permissions.includes(permission);

    // Local state for UI management
    const [items, setItems] = useState([{ product_id: "", quantity: 1, unit_price: 0 }]);
    const [selectedProducts, setSelectedProducts] = useState({});

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: "",
        customer_phone: "",
        payment_method: "cash",
        total_amount: 0,
        items: [], 
    });

    // Synchronize local items and total_amount with the Inertia form state
    useEffect(() => {
        const formattedItems = items.filter(item => item.product_id !== "").map(item => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
        }));

        const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

        setData(prevData => ({
            ...prevData,
            items: formattedItems,
            total_amount: total.toFixed(2)
        }));
    }, [items]);

    const addItem = () => {
        setItems([...items, { product_id: "", quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
            
            const newSelected = { ...selectedProducts };
            delete newSelected[index];
            setSelectedProducts(newSelected);
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        
        if (field === "product_id" && value) {
            const product = products.find(p => p.id == value);
            if (product) {
                newItems[index].unit_price = parseFloat(product.unit_sell_price);
                setSelectedProducts(prev => ({ ...prev, [index]: product }));
            }
        }
        setItems(newItems);
    };

    const calculateSubtotal = (item) => (item.quantity * item.unit_price).toFixed(2);

    const submit = (e) => {
        e.preventDefault();

        if (data.items.length === 0) {
            alert("⚠️ Please add at least one valid product.");
            return;
        }

        post('/sales', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setItems([{ product_id: "", quantity: 1, unit_price: 0 }]);
                setSelectedProducts({});
            },
            onError: (err) => {
                console.error("❌ Submission failed:", err);
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">New Sale</h1>
                    <p className="text-gray-500 mt-1">Create a new sales transaction</p>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-800">Customer Information</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                                <input
                                    type="text"
                                    value={data.customer_name}
                                    onChange={(e) => setData("customer_name", e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={data.customer_phone}
                                    onChange={(e) => setData("customer_phone", e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.customer_phone && <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>}
                            </div>
                        </div>
                        <div className="mt-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                            <select
                                value={data.payment_method}
                                onChange={(e) => setData("payment_method", e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="cash">💵 Cash</option>
                                <option value="cbe">🏦 CBE (Commercial Bank of Ethiopia)</option>
                                <option value="other_bank">🏦 Other Bank</option>
                                <option value="telebirr">📱 Tele Birr</option>
                            </select>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Items</h2>
                        <button type="button" onClick={addItem} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                            Add Item
                        </button>
                    </div>
                    
                    <div className="p-6">
                        {items.map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                                <div className="flex items-start justify-between mb-3">
                                    <span className="font-medium text-gray-800">Item #{index + 1}</span>
                                    <button type="button" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-800 text-sm">
                                        Delete
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-2">
                                        <select
                                            value={item.product_id}
                                            onChange={(e) => updateItem(index, "product_id", e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                                            required
                                        >
                                            <option value="">Select a product...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id} disabled={p.current_quantity <= 0}>
                                                    {p.name} ({p.current_quantity} in stock)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            value={item.unit_price}
                                            onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-3 text-right font-semibold">
                                    Br {calculateSubtotal(item)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                        <div className="text-lg font-bold">Total: <span className="text-green-600">Br {data.total_amount}</span></div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {processing ? "Processing..." : "Complete Sale"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}