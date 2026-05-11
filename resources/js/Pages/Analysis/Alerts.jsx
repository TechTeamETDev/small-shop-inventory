import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage, Link } from "@inertiajs/react";

const Alerts = () => {
    const { alerts } = usePage().props;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
                <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-red-900">🚨 All Alerts</h1>
                    <Link href="/analysis" className="text-sm text-blue-600">← Back to Analysis</Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Alert Type</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Message</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.data?.map((alert) => (
                                <tr key={alert.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{alert.product_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{alert.alert_type}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">{alert.priority}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{alert.alert_message}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{new Date(alert.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6">
                    <div className="flex justify-end space-x-2">
                        {alerts.prev_page_url && (
                            <Link href={alerts.prev_page_url} className="px-3 py-1 border rounded">Previous</Link>
                        )}
                        {alerts.next_page_url && (
                            <Link href={alerts.next_page_url} className="px-3 py-1 bg-blue-600 text-white rounded">Next</Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

Alerts.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default Alerts;
