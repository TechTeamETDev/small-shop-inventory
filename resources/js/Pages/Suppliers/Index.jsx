import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, suppliers }) {
    
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
            router.delete(route('suppliers.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-4">
                        {/* Navigation Icon */}
                        <Link
                            href={route('dashboard')}
                            className="flex items-center justify-center w-12 h-12 bg-black rounded-2xl shadow-lg hover:opacity-80 transition-all"
                        >
                            <div className="flex items-center justify-center w-7 h-7 border-2 border-white rounded-full">
                                <svg 
                                    className="w-4 h-4 text-white" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={3} 
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                                    />
                                </svg>
                            </div>
                        </Link>

                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 leading-tight">Suppliers</h2>
                            <p className="text-sm text-gray-500">Track and manage your inventory supply partners.</p>
                        </div>
                    </div>

                    {/* Moved "Add New Supplier" Button here to match Purchase Management layout */}
                    <Link
                        href={route('suppliers.create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition duration-150 ease-in-out font-bold flex items-center gap-2"
                    >
                        <span className="text-xl">+</span> Add New Supplier
                    </Link>
                </div>
            }
        >
            <Head title="Suppliers" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Table Container */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Address</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {suppliers.length > 0 ? (
                                    suppliers.map((supplier) => (
                                        <tr key={supplier.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {supplier.name}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                                                {supplier.email || '—'}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                                                {supplier.phone || '—'}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400">
                                                {supplier.address || '—'}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center gap-4">
                                                    <Link 
                                                        href={route('suppliers.edit', supplier.id)} 
                                                        className="text-blue-600 hover:text-blue-800 transition-colors font-bold"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <span className="text-gray-200">|</span>
                                                    <button
                                                        onClick={() => handleDelete(supplier.id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors font-bold"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                            No suppliers found.
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