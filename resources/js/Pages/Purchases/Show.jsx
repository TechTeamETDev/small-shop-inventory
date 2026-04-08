import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ auth, purchase }) {
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-50 text-green-700 border-green-200';
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Purchase #${purchase.id}`} />
            
            {/* Reduced overall vertical padding from py-12 to py-6 */}
            <div className="py-6 bg-[#F8F9FA] min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Header Section: Thinner gap and smaller text */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Link href={route('purchases.index')} 
                                  className="bg-black p-2 rounded-lg hover:bg-gray-800 transition-all shadow-sm">
                                <span className="text-white text-base">←</span>
                            </Link>
                            <div>
                                <h1 className="text-xl font-black text-black tracking-tight">
                                    <span className="text-gray-300">#</span>{purchase.id} - Purchase Details
                                </h1>
                                <p className="text-slate-500 font-medium text-[11px]">Viewing restock record.</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(purchase.status)}`}>
                            {purchase.status}
                        </span>
                    </div>

                    {/* Summary Card: Reduced padding from p-8 to p-5 */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
                        <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 border-b border-gray-50 pb-3">
                            Transaction Summary
                        </h3>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Supplier</p>
                                <p className="font-bold text-black text-sm">{purchase.supplier?.name || 'System Record'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Date</p>
                                <p className="font-bold text-black text-sm">
                                    {new Date(purchase.purchase_date).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Recorded By</p>
                                <p className="font-bold text-black text-sm">{purchase.user?.name || 'Admin'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table: Shrunk cell padding from py-6 to py-3 */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-5 py-3 text-[9px] font-black text-black uppercase tracking-widest">Description</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-black uppercase tracking-widest text-center">Qty</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-black uppercase tracking-widest text-right">Price</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-black uppercase tracking-widest text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {purchase.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-5 py-3 font-bold text-black text-xs">
                                            {item.product?.name}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded font-black text-[10px]">
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right text-xs font-bold text-slate-600">
                                            {parseFloat(item.unit_cost).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3 text-right font-black text-black text-xs">
                                            {parseFloat(item.subtotal).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50/50 border-t border-gray-100">
                                    <td colSpan="3" className="px-5 py-4 text-[10px] font-black text-black uppercase text-right">Total:</td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="text-xl font-black text-blue-600 tracking-tight">
                                            <span className="text-[10px] mr-1">ETB</span>
                                            {parseFloat(purchase.total_cost).toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}