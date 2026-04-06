import React, { useState, useEffect } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ auth, purchase, categories, suppliers }) {
    const { data, setData, put, processing, errors } = useForm({
        supplier_id: purchase.supplier_id || '',
        purchase_date: purchase.purchase_date ? purchase.purchase_date.slice(0, 16) : '',
        status: purchase.status || 'Pending',
        items: purchase.items.map(item => ({
            id: item.product_id,
            name: item.product?.name || 'Product',
            category_id: item.product?.category_id, // Added to help populate category box
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            subtotal: item.quantity * item.unit_cost
        })),
    });

    const [selectedCategory, setSelectedCategory] = useState('');
    const [availableProducts, setAvailableProducts] = useState([]);
    const [tempItem, setTempItem] = useState({ id: '', name: '', quantity: 1, unit_cost: 0 });

    // Fetch products when category changes
    useEffect(() => {
        if (selectedCategory) {
            fetch(`/purchases/get-products/${selectedCategory}`)
                .then(res => res.json())
                .then(data => setAvailableProducts(data));
        }
    }, [selectedCategory]);

    const handleEditRow = (index) => {
        const item = data.items[index];
        
        // 1. Set the category first (this triggers the useEffect above)
        setSelectedCategory(item.category_id || '');
        
        // 2. Populate the editing boxes
        setTempItem({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unit_cost: item.unit_cost
        });
        
        // 3. Remove from the current list so it can be "re-added"
        setData('items', data.items.filter((_, i) => i !== index));
    };

   const addItem = () => {
    if (!tempItem.id || !tempItem.quantity) return;
    
    const subtotal = parseFloat(tempItem.quantity) * tempItem.unit_cost;
    
    // We add 'product_id' here so the array is consistent
    setData('items', [...data.items, { 
        ...tempItem, 
        product_id: tempItem.id, 
        subtotal, 
        category_id: selectedCategory 
    }]);
    
    setTempItem({ id: '', name: '', quantity: 1, unit_cost: 0 });
};

    const totalCost = data.items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0).toFixed(2);
const handleSubmit = (e) => {
    e.preventDefault();

    // The key fix: We must map the items to ensure the backend receives 
    // the 'product_id' key it's looking for at line 163.
    const payload = {
        ...data,
        total_cost: totalCost, 
        items: data.items.map(item => ({
            // If the item has product_id use it, otherwise use id
            product_id: item.product_id || item.id, 
            quantity: item.quantity,
            unit_cost: item.unit_cost
        }))
    };

    put(route('purchases.update', purchase.id), payload, {
        onSuccess: () => console.log("Purchase #1 updated!"),
        onError: (err) => console.error("Update failed", err),
    });
};

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Purchase" />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-50/50 min-h-screen">
                
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit Purchase #{purchase.id}</h2>
                        <p className="text-gray-500 text-xs">Update details for inventory restock.</p>
                    </div>
                    <Link href={route('purchases.index')} className="text-gray-400 hover:text-gray-600 text-sm font-medium">
                        ← Back to List
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                                Modify Items
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="text-[11px] font-bold text-black uppercase mb-2 block tracking-wider">1. Category</label>
                                    <select 
                                        value={selectedCategory} 
                                        onChange={e => setSelectedCategory(e.target.value)} 
                                        className="w-full border-gray-100 rounded-xl text-sm py-3 bg-gray-50/50 focus:ring-blue-500"
                                    >
                                        <option value="">Select...</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-black uppercase mb-2 block tracking-wider">2. Product</label>
                                    <select 
                                        value={tempItem.id} 
                                        onChange={e => {
                                            const p = availableProducts.find(x => x.id == e.target.value);
                                            if(p) setTempItem({...tempItem, id: p.id, name: p.name, unit_cost: p.unit_buy_price});
                                        }}
                                        className="w-full border-gray-100 rounded-xl text-sm py-3 bg-gray-50/50"
                                    >
                                        <option value="">{tempItem.id ? tempItem.name : 'Choose product'}</option>
                                        {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-black uppercase mb-2 block tracking-wider">Quantity</label>
                                    <input 
                                        type="number" 
                                        value={tempItem.quantity} 
                                        onChange={e => setTempItem({...tempItem, quantity: parseInt(e.target.value) || 1})} 
                                        className="w-full border-gray-100 rounded-xl text-sm py-3 bg-gray-50/50"
                                    />
                                </div>
                                <button type="button" onClick={addItem} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 text-sm">
                                    {tempItem.id ? 'Update' : 'Add Item'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Product Name</th>
                                        <th className="px-8 py-5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">Qty</th>
                                        <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.items.length > 0 ? (
                                        data.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-blue-50/30 group transition-colors">
                                                <td className="px-8 py-5 font-bold text-gray-700 text-sm">{item.name}</td>
                                                <td className="px-8 py-5 text-center font-bold text-gray-500 text-sm">{item.quantity}</td>
                                                <td className="px-8 py-5 text-right font-black text-gray-800 flex justify-end items-center gap-6">
                                                    <span className="text-sm">ETB {parseFloat(item.subtotal).toLocaleString()}</span>
                                                    <div className="flex gap-3">
                                                        <button type="button" onClick={() => handleEditRow(index)} className="text-blue-500 hover:text-blue-700 text-xs font-bold uppercase tracking-tighter">Edit</button>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setData('items', data.items.filter((_, i) => i !== index))} 
                                                            className="text-red-300 hover:text-red-500 text-xs font-bold uppercase tracking-tighter"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-12 text-center text-gray-300 font-medium italic">No items in this purchase.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-8">
                            <h3 className="font-bold text-gray-900 mb-8 text-lg">Summary</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[11px] font-bold text-black uppercase mb-2 block tracking-wider">Supplier</label>
                                    <select value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} className="w-full border-gray-100 rounded-xl text-sm py-3 bg-gray-50/50 focus:ring-blue-500 font-bold">
                                        <option value="">Select Vendor</option>
                                        {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                                    </select>
                                    {errors.supplier_id && <div className="text-red-500 text-[10px] mt-1 font-bold">{errors.supplier_id}</div>}
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-black uppercase mb-2 block tracking-wider">Date</label>
                                    <input type="datetime-local" value={data.purchase_date} onChange={e => setData('purchase_date', e.target.value)} className="w-full border-gray-100 rounded-xl text-sm py-3 bg-gray-50/50 focus:ring-blue-500" />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-black uppercase mb-2 block tracking-wider">Status</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full border-gray-100 rounded-xl text-sm py-3 bg-gray-50/50 focus:ring-blue-500 font-bold">
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="pt-8 mt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-8">
                                        <span className="text-gray-400 font-bold text-[11px] uppercase tracking-widest">Total Amount</span>
                                        <span className="text-2xl font-black text-blue-600">ETB {totalCost}</span>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={processing || data.items.length === 0} 
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-200 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 active:scale-95 text-[11px]"
                                    >
                                        {processing ? 'Saving...' : 'Update Purchase'}
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