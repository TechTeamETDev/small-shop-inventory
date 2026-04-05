import React, { useState, useEffect } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ auth, purchase, categories }) {
    // Initialize form with existing purchase data
    const { data, setData, put, processing, errors } = useForm({
        supplier_name: purchase.supplier_name || '',
        // Formats date for the datetime-local input
        purchase_date: purchase.purchase_date ? purchase.purchase_date.slice(0, 16) : '',
        status: purchase.status || 'Pending',
        // Map items to include necessary fields for the table
        items: purchase.items.map(item => ({
            product_id: item.product_id,
            name: item.product.name,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            subtotal: item.quantity * item.unit_cost
        })),
    });

    const [selectedCategory, setSelectedCategory] = useState('');
    const [availableProducts, setAvailableProducts] = useState([]);
    const [tempItem, setTempItem] = useState({ product_id: '', name: '', quantity: 1, unit_cost: 0 });

    useEffect(() => {
        if (selectedCategory) {
            fetch(`/purchases/get-products/${selectedCategory}`)
                .then(res => res.json())
                .then(data => setAvailableProducts(data));
        }
    }, [selectedCategory]);

    const addItem = () => {
        if (!tempItem.product_id || tempItem.quantity <= 0) return;
        const subtotal = tempItem.quantity * tempItem.unit_cost;
        setData('items', [...data.items, { ...tempItem, subtotal }]);
        setTempItem({ product_id: '', name: '', quantity: 1, unit_cost: 0 });
    };

    const removeItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const totalCost = data.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Use PUT for updating existing records
        put(route('purchases.update', purchase.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Edit Purchase - ${purchase.supplier_name}`} />
            
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-800">Edit Purchase #{purchase.id}</h2>
                    <Link href={route('purchases.index')} className="text-gray-500 hover:text-gray-700 font-bold flex items-center gap-1">
                        &larr; Back to List
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT SECTION: ITEM MANAGEMENT */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </span>
                                Modify Items
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Category</label>
                                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all">
                                        <option value="">Select...</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Product</label>
                                    <select 
                                        value={tempItem.product_id} 
                                        onChange={e => {
                                            const p = availableProducts.find(x => x.id == e.target.value);
                                            setTempItem({...tempItem, product_id: p.id, name: p.name, unit_cost: p.unit_buy_price});
                                        }} 
                                        className="w-full border-gray-200 rounded-xl disabled:bg-gray-50"
                                        disabled={!selectedCategory}
                                    >
                                        <option value="">Choose...</option>
                                        {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Quantity</label>
                                    <input type="number" value={tempItem.quantity} onChange={e => setTempItem({...tempItem, quantity: e.target.value})} className="w-full border-gray-200 rounded-xl" />
                                </div>

                                <button type="button" onClick={addItem} className="bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* ITEMS TABLE */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Product</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Qty</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Subtotal</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-gray-800">{item.name}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold">{item.quantity}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-gray-900">ETB {item.subtotal.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button type="button" onClick={() => removeItem(index)} className="text-red-300 hover:text-red-600 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RIGHT SECTION: SETTINGS */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                                Update Details
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-600 block mb-2">Supplier</label>
                                    <input type="text" value={data.supplier_name} onChange={e => setData('supplier_name', e.target.value)} className="w-full border-gray-200 rounded-xl" required />
                                    {errors.supplier_name && <div className="text-red-500 text-xs mt-1">{errors.supplier_name}</div>}
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-600 block mb-2">Date</label>
                                    <input type="datetime-local" value={data.purchase_date} onChange={e => setData('purchase_date', e.target.value)} className="w-full border-gray-200 rounded-xl" required />
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-600 block mb-2">Status</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full border-gray-200 rounded-xl">
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>

                                <div className="mt-8 pt-6 border-t border-dashed">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-gray-400 font-medium">New Total</span>
                                        <span className="text-2xl font-black text-blue-600">ETB {totalCost}</span>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={processing || data.items.length === 0}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {processing ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}