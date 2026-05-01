import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import { usePage } from "@inertiajs/react";

const Dashboard = () => {
    const {
        totalProducts,
        lowStockCount,
        lowStockProducts,
    } = usePage().props;

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <p className="text-sm text-slate-500">Total Products</p>
                    <p className="text-2xl font-semibold">{totalProducts}</p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <p className="text-sm text-slate-500">Today's Sales</p>
                    <p className="text-2xl font-semibold">--</p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <p className="text-sm text-slate-500">Low Stock Products</p>
                    <p className="text-2xl font-semibold text-red-600">
                        {lowStockCount}
                    </p>
                </div>
            </div>

        </div>
    );
};

Dashboard.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default Dashboard;
