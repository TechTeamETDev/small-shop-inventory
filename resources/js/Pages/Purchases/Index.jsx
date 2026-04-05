import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, purchases }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Purchases" />
            
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* HEADER SECTION */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        {/* MINIMAL BOLD BLACK BACK BUTTON (ICON ONLY) */}
                        <Link 
                            href={route('dashboard')} 
                            className="flex items-center justify-center w-12 h-12 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                            title="Back to Dashboard"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                            </svg>
                        </Link>
                        
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Purchase Management</h2>
                            <p className="text-sm text-gray-500">Track and manage your inventory supply orders.</p>
                        </div>
                    </div>
                    
                    <Link 
                        href={route('purchases.create')} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Purchase
                    </Link>
                </div>

                {/* TABLE SECTION */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                {/* BOLD BLACK HEADERS */}
                                <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest">Supplier</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-black uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {purchases.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No purchases found.</td>
                                </tr>
                            ) : (
                                purchases.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            {/* CLEAN SUPPLIER NAME */}
                                            <div className="font-bold text-gray-800">{purchase.supplier_name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            {new Date(purchase.purchase_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* ETB CURRENCY FORMATTING */}
                                            <span className="font-black text-gray-900">ETB {parseFloat(purchase.total_cost).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter ${
                                                purchase.status === 'Completed' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {purchase.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-4">
                                                <Link 
                                                    href={route('purchases.edit', purchase.id)} 
                                                    className="text-blue-600 hover:text-blue-800 font-bold text-sm transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                                <span className="text-gray-200">|</span>
                                                <Link 
                                                    href={route('purchases.show', purchase.id)} 
                                                    className="text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}