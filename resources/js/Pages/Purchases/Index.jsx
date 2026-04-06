import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ auth, purchases }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this purchase record?')) {
            destroy(route('purchases.destroy', id));
        }
    };

    // Helper to style status badges dynamically
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'cancelled':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Purchases" />

            <div className="py-10 bg-[#F8F9FA] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* HEADER SECTION */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <Link href={route('dashboard')} className="bg-white p-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center shadow-sm border border-gray-200">
                                <span className="text-black text-lg font-black">←</span>
                            </Link>
                            <div>
                                {/* UPDATED: Main Title to Bold Black */}
                                <h1 className="text-3xl font-extrabold text-black tracking-tight">Purchase Management</h1>
                                <p className="text-slate-500 font-medium text-sm">Track and manage supply orders.</p>
                            </div>
                        </div>
                        <Link
                            href={route('purchases.create')}
                            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                        >
                            + New Purchase
                        </Link>
                    </div>

                    {/* TABLE CONTAINER */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-gray-200">
                                    {/* UPDATED: Table Headers to Font Black and Bold */}
                                    <th className="px-6 py-5 text-[11px] font-black text-black uppercase tracking-widest">Supplier</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-black uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-black uppercase tracking-widest">Total Amount</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-black uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-black uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {purchases && purchases.length > 0 ? (
                                    purchases.map((purchase) => (
                                        <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                {/* UPDATED: Supplier Name to Black */}
                                                <div className="font-bold text-black text-sm">
                                                    {purchase.supplier?.name || 'Unknown Supplier'}
                                                </div>
                                                
                                            </td>
                                            <td className="px-6 py-5 text-sm text-slate-700 font-bold">
                                                {new Date(purchase.purchase_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-5 font-black text-black text-base">
                                                <span className="text-blue-600 text-xs mr-1 font-black">ETB</span>
                                                {parseFloat(purchase.total_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(purchase.status)}`}>
                                                    {purchase.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end items-center gap-4">
                                                    <Link 
                                                        href={route('purchases.show', purchase.id)} 
                                                        className="text-slate-400 hover:text-black font-black text-xs transition-colors uppercase tracking-tighter"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link 
                                                        href={route('purchases.edit', purchase.id)} 
                                                        className="text-slate-400 hover:text-blue-600 font-black text-xs transition-colors uppercase tracking-tighter"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(purchase.id)}
                                                        className="text-slate-300 hover:text-red-600 font-black text-xs transition-colors uppercase tracking-tighter"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-24 text-center">
                                            <div className="text-slate-400 text-sm font-bold italic">No purchase records found.</div>
                                            <Link href={route('purchases.create')} className="text-blue-600 text-xs font-black mt-3 inline-block hover:underline uppercase tracking-widest">
                                                Create your first purchase order
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}