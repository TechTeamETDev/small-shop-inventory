// refresh fix
import React, { useState, useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ auth, categories, suppliers, purchase }) {
    const { data, setData, post, put, processing, errors } = useForm({
        // 1. Matches Controller's 'supplier_id'
        supplier_id: purchase ? purchase.supplier_id : '', 
        purchase_date: purchase ? purchase.purchase_date : new Date().toISOString().slice(0, 16),
        status: purchase ? purchase.status : 'Pending',
        items: purchase ? purchase.items.map(item => ({
            id: item.product_id, // Ensure we send ID to Controller
            name: item.product.name,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            subtotal: item.subtotal
        })) : [], 
    });

    const [selectedCategory, setSelectedCategory] = useState('');
    const [availableProducts, setAvailableProducts] = useState([]);
    
    // Quantity set to empty string to prevent the "sticky 1" bug
    const [tempItem, setTempItem] = useState({ id: '', name: '', quantity: '', unit_cost: 0 });

    useEffect(() => {
        if (selectedCategory) {
            fetch(`/purchases/get-products/${selectedCategory}`)
                .then(res => res.json())
                .then(data => setAvailableProducts(data));
        } else {
            setAvailableProducts([]);
        }
    }, [selectedCategory]);

    const addItem = () => {
        // Validation: ensures quantity is a valid number before adding
        if (!tempItem.id || !tempItem.quantity || tempItem.quantity <= 0) return;
        
        const subtotal = tempItem.quantity * tempItem.unit_cost;
        setData('items', [...data.items, { ...tempItem, subtotal }]);
        
        // Reset to clean state
        setTempItem({ id: '', name: '', quantity: '', unit_cost: 0 });
    };

    const removeItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const total_cost = data.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // We explicitly add total_cost to the object before sending
        const payload = { ...data, total_cost: total_cost };

        if (purchase) {
            put(route('purchases.update', purchase.id), payload);
        } else {
            post(route('purchases.store'), payload);
        }
    };

    return (
        <AuthenticatedLayout 
            user={auth.user}
            header={
                <div>
                    <h2 className="font-bold text-2xl text-gray-900 leading-tight">
                        {purchase ? 'Edit Purchase' : 'Create Purchase'}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {purchase ? `Editing purchase #${purchase.id}` : 'Add new inventory items to your stock.'}
                    </p>
                </div>
            }
        >
            <Head title={purchase ? "Edit Purchase" : "Create Purchase"} />
            
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </span>
                                Add Inventory Items
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="md:col-span-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">1. Category</label>
                                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full border-gray-200 rounded-xl">
                                        <option value="">Select...</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                
                                <div className="md:col-span-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">2. Product</label>
                                    <select 
                                        value={tempItem.id} 
                                        onChange={e => {
                                            const p = availableProducts.find(x => x.id == e.target.value);
                                            if (p) setTempItem({...tempItem, id: p.id, name: p.name, unit_cost: p.unit_buy_price});
                                        }} 
                                        className="w-full border-gray-200 rounded-xl disabled:bg-gray-50"
                                        disabled={!selectedCategory}
                                    >
                                        <option value="">Choose product</option>
                                        {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Quantity</label>
                                    <input 
                                        type="number" 
                                        value={tempItem.quantity} 
                                        onChange={e => setTempItem({...tempItem, quantity: e.target.value === '' ? '' : parseInt(e.target.value)})} 
                                        onFocus={(e) => e.target.select()}
                                        className="w-full border-gray-200 rounded-xl" 
                                        placeholder="0"
                                    />
                                </div>

                                <button type="button" onClick={addItem} className="bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg">
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Product Name</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Qty</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Subtotal</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.items.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-16 text-center text-gray-400 italic">No items added yet.</td>
                                        </tr>
                                    ) : (
                                        data.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-blue-50/30">
                                                <td className="px-6 py-4 font-semibold text-gray-800">{item.name}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold">{item.quantity}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-gray-900">ETB {parseFloat(item.subtotal).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button type="button" onClick={() => removeItem(index)} className="text-red-300 hover:text-red-600">Remove</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">Summary</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-600 block mb-2">Supplier</label>
                                    <select 
                                        value={data.supplier_id} 
                                        onChange={e => setData('supplier_id', e.target.value)} 
                                        className="w-full border-gray-200 rounded-xl"
                                        required
                                    >
                                        <option value="">Select Vendor</option>
                                        {suppliers.map(vendor => (
                                            <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                                        ))}
                                    </select>
                                    {errors.supplier_id && <div className="text-red-500 text-xs mt-1">{errors.supplier_id}</div>}
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
                                        <span className="text-gray-400 font-medium">Total Amount</span>
                                        <span className="text-2xl font-black text-blue-600">ETB {total_cost}</span>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={processing || data.items.length === 0}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : (purchase ? 'Update Purchase' : 'Confirm Purchase')}
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