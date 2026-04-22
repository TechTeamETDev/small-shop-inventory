import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import { usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

const Dashboard = () => {
    const { products = [] } = usePage().props;
    return (
        <>
            {/* Stats Cards ONLY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-lg p-5">
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-2xl font-semibold">
                        {products?.length || 0}
                    </p>
                </div>

                <div className="bg-white rounded-lg p-5">
                    <p className="text-sm text-gray-500">Today's Sales</p>
                    <p className="text-2xl font-semibold">--</p>
                </div>

                <div className="bg-white rounded-lg p-5">
                    <p className="text-sm text-gray-500">Low Stock</p>
                    <p className="text-2xl font-semibold">--</p>
                </div>
            </div>
        </>
    );
};

Dashboard.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default Dashboard;
