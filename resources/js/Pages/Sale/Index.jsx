import { Link, router, usePage } from "@inertiajs/react";

export default function Index({ sales }) {
    const { auth } = usePage().props;
    const permissions = auth?.user?.permissions || [];
    const can = (permission) => permissions.includes(permission);

    // Delete sale with confirmation
    const deleteSale = (sale) => {
        if (
            confirm(
                `⚠️ Are you sure you want to delete Sale #${sale.id}?\n\nThis will:\n- Cancel the sale\n- Restore ${sale.items.reduce((sum, item) => sum + item.quantity, 0)} items to stock\n\nThis action cannot be undone!`,
            )
        ) {
            router.delete(route("sales.destroy", sale.id), {
                preserveScroll: true,
                onSuccess: () => {
                    console.log("✅ Sale deleted successfully!");
                },
                onError: (errors) => {
                    console.error("❌ Failed to delete sale:", errors);
                    alert(
                        "Failed to delete sale: " +
                            Object.values(errors).flat().join(", "),
                    );
                },
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Sales
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Manage sales transactions
                        </p>
                    </div>

                    {/* ✅ Show "New Sale" button only if user has permission */}
                    {can("create sales") && (
                        <Link
                            href={route("sales.create")}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            New Sale
                        </Link>
                    )}
                </div>

                {/* Success Message */}
                {sales?.data?.length > 0 && (
                    <div className="mb-6">
                        <p className="text-sm text-gray-600">
                            Showing{" "}
                            <span className="font-semibold">
                                {sales.data.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold">{sales.total}</span>{" "}
                            sales
                        </p>
                    </div>
                )}

                {/* Sales Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    {/* ✅ Actions Column */}
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sales.data.length > 0 ? (
                                    sales.data.map((sale) => (
                                        <tr
                                            key={sale.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{sale.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {sale.customer_name ||
                                                    "Walk-in Customer"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                Br{" "}
                                                {parseFloat(
                                                    sale.total_amount,
                                                ).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {sale.payment_method ===
                                                    "cash" && "💵 Cash"}
                                                {sale.payment_method ===
                                                    "cbe" && "🏦 CBE"}
                                                {sale.payment_method ===
                                                    "other_bank" &&
                                                    "🏦 Other Bank"}
                                                {sale.payment_method ===
                                                    "telebirr" &&
                                                    "📱 Tele Birr"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        sale.status ===
                                                        "completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : sale.status ===
                                                                "cancelled"
                                                              ? "bg-red-100 text-red-800"
                                                              : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
                                                    {sale.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(
                                                    sale.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* View Button */}
                                                    <Link
                                                        href={route(
                                                            "sales.show",
                                                            sale.id,
                                                        )}
                                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        View
                                                    </Link>

                                                    {/* ✅ Delete Button - Only for users with permission */}
                                                    {can("delete sales") ||
                                                    can("manage users") ? (
                                                        <button
                                                            onClick={() =>
                                                                deleteSale(sale)
                                                            }
                                                            className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                                                            title="Delete this sale (restores stock)"
                                                        >
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                            Delete
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <svg
                                                    className="w-12 h-12 text-gray-400 mb-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                <p className="text-gray-500 text-lg font-medium">
                                                    No sales found
                                                </p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    Sales transactions will
                                                    appear here
                                                </p>
                                                {can("create sales") && (
                                                    <Link
                                                        href={route(
                                                            "sales.create",
                                                        )}
                                                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Create Your First Sale
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {sales.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Page{" "}
                                    <span className="font-medium">
                                        {sales.current_page}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium">
                                        {sales.last_page}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {/* Previous Button */}
                                    {sales.links.prev ? (
                                        <Link
                                            href={sales.links.prev}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            ← Previous
                                        </Link>
                                    ) : (
                                        <button
                                            disabled
                                            className="px-4 py-2 border border-gray-300 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
                                        >
                                            ← Previous
                                        </button>
                                    )}

                                    {/* Next Button */}
                                    {sales.links.next ? (
                                        <Link
                                            href={sales.links.next}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            Next →
                                        </Link>
                                    ) : (
                                        <button
                                            disabled
                                            className="px-4 py-2 border border-gray-300 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
                                        >
                                            Next →
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
