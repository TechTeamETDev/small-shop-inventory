import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, purchase }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Purchase Details - ${purchase.supplier_name}`} />
            
            <div className="p-6">
                <div className="mb-6">
                    <Link href={route('purchases.index')} className="text-blue-600 hover:underline">
                        &larr; Back to List
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex justify-between border-b pb-4 mb-4">
                        <div>
                            <h2 className="text-xl font-bold">Purchase #{purchase.id}</h2>
                            <p className="text-gray-600">Supplier: <span className="font-semibold">{purchase.supplier_name}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-600">Date: {new Date(purchase.purchase_date).toLocaleDateString()}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${purchase.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {purchase.status}
                            </span>
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-3 border-b">Product</th>
                                <th className="p-3 border-b text-center">Quantity</th>
                                <th className="p-3 border-b text-right">Unit Cost</th>
                                <th className="p-3 border-b text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchase.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="p-3 border-b">{item.product.name}</td>
                                    <td className="p-3 border-b text-center">{item.quantity}</td>
                                    <td className="p-3 border-b text-right">${item.unit_cost}</td>
                                    <td className="p-3 border-b text-right">${item.subtotal}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3" className="p-3 text-right font-bold">Grand Total:</td>
                                <td className="p-3 text-right font-bold text-blue-600">${purchase.total_cost}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}