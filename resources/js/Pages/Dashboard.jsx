import React from "react";
import { usePage, useForm, Link } from "@inertiajs/react";

const Dashboard = () => {
    const { auth } = usePage().props;
    const permissions = auth.user.permissions; // array of permission names

    const { post } = useForm(); // For logout

    // Helper function
    const can = (permission) => permissions.includes(permission);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Dashboard
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Welcome back, {auth.user.name || "User"}!
                            </p>
                        </div>
                        <button
                            onClick={() => post("/logout")}
                            className="group relative px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                                Logout
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview (Optional decorative section) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">
                                    Total Products
                                </p>
                                <p className="text-3xl font-bold">--</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-3">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">
                                    Today's Sales
                                </p>
                                <p className="text-3xl font-bold">--</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-3">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">
                                    Low Stock Items
                                </p>
                                <p className="text-3xl font-bold">--</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-3">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {can("view products") && (
                        <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-blue-100 rounded-lg p-3">
                                        <svg
                                            className="w-6 h-6 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                        Inventory
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    Inventory Management
                                </h2>
                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                    View and manage product stock levels, update
                                    prices, and track inventory movement.
                                </p>
                                <Link
                                    href="/products"
                                    className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors"
                                >
                                    Go to Products
                                    <svg
                                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}
                    {can("manage categories") && (
                        <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-teal-500 to-teal-600"></div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-teal-100 rounded-lg p-3">
                                        <svg
                                            className="w-6 h-6 text-teal-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 011.414.586 2 2 0 011.414.586L21 13a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-5-5a2 2 0 01-.586-1.414V9a2 2 0 011-1.732V7a2 2 0 01-2-2z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                                        Organization
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    Categories
                                </h2>
                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                    Organize products with categories and
                                    subcategories for better management.
                                </p>
                                <Link
                                    href="/categories"
                                    className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700 transition-colors"
                                >
                                    Go to Categories
                                    <svg
                                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}

                    {can("create sales") && (
                        <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-green-100 rounded-lg p-3">
                                        <svg
                                            className="w-6 h-6 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        Transactions
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    Sales Management
                                </h2>
                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                    Record sales transactions, process payments,
                                    and manage customer orders.
                                </p>
                                <button className="inline-flex items-center text-green-600 font-medium hover:text-green-700 transition-colors">
                                    Go to Sales
                                    <svg
                                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {can("create purchases") && (
                        <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-indigo-100 rounded-lg p-3">
                                        <svg
                                            className="w-6 h-6 text-indigo-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                        Procurement
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    Purchase Orders
                                </h2>
                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                    Manage supplier purchases, track orders, and
                                    maintain stock levels.
                                </p>
                                <button className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                                    Go to Purchases
                                    <svg
                                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {can("view analytics") && (
                        <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-yellow-100 rounded-lg p-3">
                                        <svg
                                            className="w-6 h-6 text-yellow-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                                        Insights
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    Analytics Dashboard
                                </h2>
                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                    View sales reports, trends, and performance
                                    metrics to make data-driven decisions.
                                </p>
                                <button className="inline-flex items-center text-yellow-600 font-medium hover:text-yellow-700 transition-colors">
                                    View Analytics
                                    <svg
                                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {can("view profit reports") && (
                        <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-purple-100 rounded-lg p-3">
                                        <svg
                                            className="w-6 h-6 text-purple-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                        Financial
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    Profit Reports
                                </h2>
                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                    Analyze profit margins, track financial
                                    performance, and monitor business growth.
                                </p>
                                <button className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700 transition-colors">
                                    View Profit
                                    <svg
                                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {can("manage users") && (
                        <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-red-100 rounded-lg p-3">
                                        <svg
                                            className="w-6 h-6 text-red-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                        Administration
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    User Management
                                </h2>
                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                    Create and manage users, assign roles, and
                                    control system access permissions.
                                </p>
                                <a
                                    href="/users"
                                    className="inline-flex items-center text-red-600 font-medium hover:text-red-700 transition-colors"
                                >
                                    Manage Users
                                    <svg
                                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
