import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage, Link } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";

const Analysis = () => {
    const { predictions, insights, alerts, stats } = usePage().props;
    const [resolvedAlerts, setResolvedAlerts] = useState(new Set());
    const visibleAlerts = (alerts || []).slice(0, 6);

    // Group alerts by product and calculate highest priority
    const groupAlertsByProduct = () => {
        const grouped = {};
        visibleAlerts.forEach((alert) => {
            if (!grouped[alert.product_id]) {
                grouped[alert.product_id] = {
                    product_id: alert.product_id,
                    product_name: alert.product_name,
                    alerts: [],
                };
            }
            grouped[alert.product_id].alerts.push(alert);
        });
        return Object.values(grouped);
    };

    const getPriorityLevel = (priority) => {
        const levels = { critical: 4, high: 3, medium: 2, low: 1 };
        return levels[priority?.toLowerCase()] || 0;
    };

    const getHighestPriority = (alertList) => {
        const priorities = ["critical", "high", "medium", "low"];
        for (let p of priorities) {
            if (alertList.some((a) => a.priority.toLowerCase() === p)) {
                return p;
            }
        }
        return "low";
    };

    const groupedAlerts = groupAlertsByProduct();

    const handleResolveAlert = async (alertId) => {
        try {
            await axios.post(`/analysis/alert/${alertId}/resolve`);
            setResolvedAlerts(new Set(resolvedAlerts).add(alertId));
        } catch (error) {
            console.error("Error resolving alert:", error);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "critical":
                return "bg-red-100 text-red-800";
            case "high":
                return "bg-orange-100 text-orange-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-green-100 text-green-800";
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case "high":
                return "text-red-600";
            case "medium":
                return "text-yellow-600";
            default:
                return "text-blue-600";
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case "up":
                return "📈";
            case "down":
                return "📉";
            default:
                return "➡️";
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">AI Analysis Dashboard</h1>
                <p className="text-blue-100">
                    View AI predictions, insights, and alerts for inventory management
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-6 shadow">
                    <p className="text-sm text-gray-500">Total Predictions</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {stats.total_predictions}
                    </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                    <p className="text-sm text-gray-500">High Severity Insights</p>
                    <p className="text-3xl font-bold text-yellow-600">
                        {stats.high_severity_insights}
                    </p>
                </div>
            </div>

            {/* Alerts Section (grouped by product) */}
            {visibleAlerts.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-red-900">
                            🚨 Active Alerts ({visibleAlerts.length})
                        </h2>
                        <Link href="/analysis/alerts" className="text-sm text-blue-600">See more</Link>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groupedAlerts.map((productGroup) => {
                            const highestPriority = getHighestPriority(
                                productGroup.alerts.filter((a) => !resolvedAlerts.has(a.id))
                            );
                            const activeAlerts = productGroup.alerts.filter((a) => !resolvedAlerts.has(a.id));

                            return activeAlerts.length > 0 ? (
                                <div key={productGroup.product_id} className="p-4 border rounded-lg bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">{productGroup.product_name}</h3>
                                            <p className="text-xs text-gray-500">{activeAlerts.length} alert{activeAlerts.length > 1 ? 's' : ''}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(highestPriority)}`}>
                                            {highestPriority.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="space-y-2 border-t pt-3">
                                        {activeAlerts.map((alert) => (
                                            <div key={alert.id} className="flex items-start justify-between text-sm">
                                                <div className="flex-1">
                                                    <p className="text-gray-700">{alert.alert_message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{alert.alert_type}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleResolveAlert(alert.id)}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium ml-2 whitespace-nowrap"
                                                >
                                                    Resolve
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;
                        })}
                    </div>
                </div>
            )}

            {/* Predictions Section (card grid) */}
            {predictions.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
                        <h2 className="text-xl font-bold text-blue-900">📊 Latest Predictions</h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {predictions.map((pred) => (
                            <div key={pred.id} className="p-4 border rounded-lg bg-white shadow-sm">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900">{pred.product_name}</h3>
                                    <div className="text-xl">{getTrendIcon(pred.trend)}</div>
                                </div>

                                <div className="mt-3 text-sm text-gray-600">
                                    <p><span className="font-medium">Predicted:</span> {pred.predicted_demand} units</p>
                                    <p className="mt-1"><span className="font-medium">Stock:</span> {pred.current_quantity} units</p>
                                </div>

                                <div className="mt-4">
                                    <div>
                                        <div className="text-xs text-gray-500">Risk</div>
                                        <div className={`text-sm font-medium ${pred.risk_score > 7 ? 'text-red-600' : pred.risk_score > 4 ? 'text-yellow-600' : 'text-green-600'}`}>{pred.risk_score.toFixed(2)}/10</div>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{pred.recommended_action}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Insights Section */}
            {insights.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-green-50 border-b border-green-200 px-6 py-4">
                        <h2 className="text-xl font-bold text-green-900">
                            💡 Latest Insights
                        </h2>
                    </div>
                    <div className="space-y-4 p-6">
                        {insights.map((insight) => (
                            <div
                                key={insight.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {insight.product_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {insight.insight_type}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-sm font-semibold ${getSeverityColor(
                                            insight.severity
                                        )}`}
                                    >
                                        {insight.severity.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">
                                    {insight.message}
                                </p>
                                {insight.reason_summary && (
                                    <p className="text-xs text-gray-500 italic">
                                        {insight.reason_summary}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(insight.created_at).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {predictions.length === 0 && alerts.length === 0 && insights.length === 0 && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500 text-lg">
                        No AI analysis data available yet. Run the AI system to generate predictions, insights, and alerts.
                    </p>
                </div>
            )}
        </div>
    );
};

Analysis.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default Analysis;
