import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const Dashboard = () => {
    return (
        <>
            {/* Stats Cards ONLY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-lg p-5">
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-2xl font-semibold">--</p>
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
