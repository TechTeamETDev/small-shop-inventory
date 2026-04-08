import { Link, router } from "@inertiajs/react";

export default function Show({ sale }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Sale #{sale.id}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Sale details and items
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href={route("sales.index")}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            ← Back to Sales
                        </Link>

                        {sale.status !== "cancelled" && (
                            <button
                                onClick={() => {
                                    if (
                                        confirm(
                                            "Cancel this sale? Stock will be restored.",
                                        )
                                    ) {
                                        router.delete(
                                            route("sales.destroy", sale.id),
                                        );
                                    }
                                }}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel Sale
                            </button>
                        )}
                    </div>
                </div>

                {/* Sale Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Sale Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">
                                    Customer
                                </label>
                                <p className="mt-1 text-lg font-medium text-gray-900">
                                    {sale.customer_name || "Walk-in Customer"}
                                </p>
                                {sale.customer_phone && (
                                    <p className="text-sm text-gray-500">
                                        {sale.customer_phone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">
                                    Payment Method
                                </label>
                                <p className="mt-1 text-lg font-medium text-gray-900 capitalize">
                                    {sale.payment_method}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </label>
                                <span
                                    className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        sale.status === "completed"
                                            ? "bg-green-100 text-green-800"
                                            : sale.status === "pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {sale.status}
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">
                                    Sale Date
                                </label>
                                <p className="mt-1 text-lg font-medium text-gray-900">
                                    {new Date(
                                        sale.created_at,
                                    ).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {new Date(
                                        sale.created_at,
                                    ).toLocaleTimeString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">
                                    Cashier
                                </label>
                                <p className="mt-1 text-lg font-medium text-gray-900">
                                    {sale.employee?.name || "Unknown"}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">
                                    Total Amount
                                </label>
                                <p className="mt-1 text-2xl font-bold text-green-600">
                                    ${parseFloat(sale.total_amount).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Sale Items
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Unit Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sale.items.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {item.product?.name ||
                                                "Unknown Product"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {item.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            $
                                            {parseFloat(
                                                item.unit_price,
                                            ).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            $
                                            {parseFloat(item.subtotal).toFixed(
                                                2,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t border-gray-200">
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-4 text-right font-semibold text-gray-700"
                                    >
                                        Total:
                                    </td>
                                    <td className="px-6 py-4 font-bold text-green-600 text-lg">
                                        $
                                        {parseFloat(sale.total_amount).toFixed(
                                            2,
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
