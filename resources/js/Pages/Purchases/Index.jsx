import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function Index({ auth, purchases, filters }) {
    const { delete: destroy } = useForm();

    // Check if we are currently in "Credit Ledger" mode
    const isCreditFilter = filters?.filter === 'credit';

    const toggleFilter = () => {
        if (isCreditFilter) {
            router.get(route('purchases.index')); // Show all
        } else {
            router.get(route('purchases.index'), { filter: 'credit' }); // Show only credit
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to cancel this purchase and reverse the stock?')) {
            destroy(route('purchases.destroy', id));
        }
    };

    const getStatusStyle = (status) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'returned': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isCreditFilter ? "Credit Ledger" : "Purchases"} />

            <div className="py-10 bg-[#F8F9FA] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* HEADER SECTION */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            {/* BACK ARROW REMOVED FROM HERE */}
                            <div>
                                <h1 className="text-3xl font-extrabold text-black tracking-tight">
                                    {isCreditFilter ? 'Credit Ledger' : 'Purchase Management'}
                                </h1>
                                <p className="text-slate-500 font-medium text-sm">
                                    {isCreditFilter ? 'Prioritizing unpaid supplier debts by due date.' : 'Track and manage supply orders.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleFilter}
                                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all border shadow-sm active:scale-95 ${
                                    isCreditFilter 
                                    ? 'bg-amber-50 border-amber-200 text-amber-700' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <span>{isCreditFilter ? '📂 Show All' : '💳 Credit Ledger'}</span>
                                {isCreditFilter && <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>}
                            </button>

                            <Link
                                href={route('purchases.create')}
                                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                            >
                                + New Purchase
                            </Link>
                        </div>
                    </div>

                    {/* TABLE CONTAINER */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-gray-200">
                                    <th className="px-6 py-5 text-[11px] font-black text-black uppercase tracking-widest">Supplier</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-black uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-black uppercase tracking-widest">Invoice No</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-black uppercase tracking-widest">Total Amount</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-black uppercase tracking-widest text-center">Payment</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-black uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-black uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {purchases && purchases.length > 0 ? (
                                    purchases.map((purchase) => {
                                        const statusLower = purchase.status?.toLowerCase();
                                        return (
                                            <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-black text-sm">{purchase.supplier?.name}</div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="text-sm text-slate-700 font-bold">
                                                        {new Date(purchase.purchase_date).toLocaleDateString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="font-mono font-bold text-black text-xs">{purchase.invoice_no}</div>
                                                </td>

                                                <td className="px-6 py-5 font-black text-black text-base">
                                                    <span className="text-blue-600 text-xs mr-1">ETB</span>
                                                    {parseFloat(purchase.total_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${purchase.payment_method === 'Credit' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                                            {purchase.payment_method || 'Cash'}
                                                        </span>
                                                        {purchase.payment_method === 'Credit' && purchase.due_date && (
                                                            <span className="text-[9px] text-red-500 font-black">
                                                                DUE: {purchase.due_date}
                                                            </span>
                                                        )}
                                                    </div>
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
                                                            className="text-blue-600 hover:text-blue-800 font-black text-[10px] uppercase tracking-widest"
                                                        >
                                                            View
                                                        </Link>
                                                        
                                                        {statusLower !== 'returned' && statusLower !== 'cancelled' && (
                                                            <button 
                                                                onClick={() => handleDelete(purchase.id)} 
                                                                className="text-red-600 hover:text-red-800 font-black text-[10px] uppercase tracking-widest"
                                                            >
                                                                Return
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-24 text-center">
                                            <div className="text-slate-400 text-sm font-bold italic">No records found matching this criteria.</div>
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