import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import { usePage } from "@inertiajs/react";
import { useState } from "react";

const actionStyles = {
    EMERGENCY_RESTOCK: "bg-red-100 text-red-700 border-red-200",
    RESTOCK: "bg-amber-100 text-amber-700 border-amber-200",
    HOLD: "bg-emerald-100 text-emerald-700 border-emerald-200",
    NO_ACTION: "bg-slate-100 text-slate-700 border-slate-200",
};

const riskStyles = {
    CRITICAL: "bg-red-100 text-red-700 border-red-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
    LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const formatLabel = (value) => {
    if (!value || value === "--") {
        return "--";
    }

    return String(value).replaceAll("_", " ");
};

const buildAdviceText = (result, product) => {
    if (!result) {
        return "Run AI to generate a recommendation for this product.";
    }

    if (result?.explanation) {
        return result.explanation;
    }

    const action = result?.decision?.action || "NO_ACTION";
    const orderQty = result?.decision?.recommended_order ?? result?.decision?.recommended_purchase_qty ?? 0;
    const risk = result?.risk?.risk_level || "LOW";

    if (action === "EMERGENCY_RESTOCK" || action === "RESTOCK") {
        return `Recommend ${formatLabel(action).toLowerCase()} for ${product.name}. Suggested order quantity is ${orderQty} units.`;
    }

    if (action === "HOLD") {
        return `Inventory is balanced for ${product.name}. Keep current stock and continue monitoring demand trend.`;
    }

    return `No immediate stock action required for ${product.name}. Current risk level is ${risk}.`;
};

const AiInsights = () => {
    const { lowStockProducts } = usePage().props;

    const [aiResults, setAiResults] = useState({});
    const [loadingIds, setLoadingIds] = useState({});
    const [loadingAll, setLoadingAll] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const runAiForProduct = async (productId) => {
        setErrorMessage("");
        setLoadingIds((prev) => ({ ...prev, [productId]: true }));

        try {
            const response = await fetch(`/ai/product/${productId}`);
            const payload = await response.json();

            if (!response.ok || payload.error) {
                throw new Error(payload.error || "AI request failed");
            }

            setAiResults((prev) => ({ ...prev, [productId]: payload }));
        } catch (error) {
            setErrorMessage(error.message || "Unable to load AI prediction");
        } finally {
            setLoadingIds((prev) => ({ ...prev, [productId]: false }));
        }
    };

    const runAiForAllLowStock = async () => {
        const products = lowStockProducts || [];

        if (products.length === 0) {
            return;
        }

        setLoadingAll(true);
        setErrorMessage("");

        try {
            await Promise.all(products.map((product) => runAiForProduct(product.id)));
        } catch (error) {
            setErrorMessage(error.message || "Unable to run AI for all products");
        } finally {
            setLoadingAll(false);
        }
    };

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-0">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                    <div className="space-y-1">
                        <h1 className="text-lg font-semibold text-gray-900">AI Insights</h1>
                        <p className="text-sm text-slate-500">
                            Professional demand forecast and stock recommendations for low-stock products.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                        onClick={runAiForAllLowStock}
                        disabled={loadingAll || !lowStockProducts?.length}
                    >
                        {loadingAll ? "Analyzing..." : "Analyze Low Stock"}
                    </button>
                </div>

                {errorMessage ? (
                    <div className="mb-3 p-3 rounded-md bg-red-50 text-red-700 text-sm">
                        {errorMessage}
                    </div>
                ) : null}

                {!lowStockProducts?.length ? (
                    <p className="text-sm text-gray-500">No low-stock products detected.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-[980px] lg:min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr className="text-left border-b border-slate-200">
                                    <th className="py-3 px-3 font-semibold text-slate-700">Product</th>
                                    <th className="py-3 px-3 font-semibold text-slate-700">Current / Min</th>
                                    <th className="py-3 px-3 font-semibold text-slate-700">AI Action</th>
                                    <th className="py-3 px-3 font-semibold text-slate-700">Recommended Order</th>
                                    <th className="py-3 px-3 font-semibold text-slate-700">Risk</th>
                                    <th className="py-3 px-3 font-semibold text-slate-700">Advice</th>
                                    <th className="py-3 px-3 font-semibold text-slate-700">Alerts</th>
                                    <th className="py-3 px-3 font-semibold text-slate-700">Run</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {lowStockProducts.map((product) => {
                                    const result = aiResults[product.id] || null;
                                    const action = result?.decision?.action || "--";
                                    const recommendedOrder = result
                                        ? (result?.decision?.recommended_order ??
                                            result?.decision?.recommended_purchase_qty ??
                                            0)
                                        : "--";
                                    const risk = result?.risk?.risk_level || "--";
                                    const alertsCount = result?.alerts?.length ?? 0;
                                    const advice = buildAdviceText(result, product);
                                    const actionStyle = actionStyles[action] || "bg-slate-100 text-slate-700 border-slate-200";
                                    const riskStyle = riskStyles[risk] || "bg-slate-100 text-slate-700 border-slate-200";

                                    return (
                                        <tr key={product.id} className="border-b border-slate-100 last:border-b-0 align-top">
                                            <td className="py-3 px-3">
                                                <div className="font-medium text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-500">ID: {product.id}</div>
                                            </td>
                                            <td className="py-3 px-3 whitespace-nowrap">
                                                {product.current_quantity} / {product.min_stock_level}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border whitespace-nowrap ${actionStyle}`}>
                                                    {formatLabel(action)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">{recommendedOrder}</td>
                                            <td className="py-3 px-3">
                                                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border whitespace-nowrap ${riskStyle}`}>
                                                    {formatLabel(risk)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-xs leading-5 text-slate-600 max-w-sm lg:max-w-md break-words">
                                                {advice}
                                            </td>
                                            <td className="py-3 px-3 whitespace-nowrap">{alertsCount}</td>
                                            <td className="py-3 px-3">
                                                <button
                                                    type="button"
                                                    className="w-full sm:w-auto min-w-[84px] px-3 py-1.5 text-xs rounded-md bg-slate-900 text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                                                    onClick={() => runAiForProduct(product.id)}
                                                    disabled={!!loadingIds[product.id]}
                                                >
                                                    {loadingIds[product.id] ? "Loading..." : "Get Recommendation"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

AiInsights.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default AiInsights;
