import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState } from "react";
import { usePage, useForm, Link } from "@inertiajs/react";

const Dashboard = () => {
    const { auth } = usePage().props;
    const permissions = auth.user.permissions; // array of permission names
    const { post } = useForm(); // For logout
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Helper function
    const can = (permission) => permissions.includes(permission);

    // Navigation items based on permissions
    const navigationItems = [
        {
            name: "Dashboard",
            icon: (
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
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                </svg>
            ),
            href: "/dashboard",
            permission: null,
        },
        {
            name: "Products",
            icon: (
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                </svg>
            ),
            href: "/products",
            permission: "view products",
        },
        {
            name: "Categories",
            icon: (
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
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 011.414.586 2 2 0 011.414.586L21 13a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-5-5a2 2 0 01-.586-1.414V9a2 2 0 011-1.732V7a2 2 0 01-2-2z"
                    />
                </svg>
            ),
            href: "/categories",
            permission: "manage categories",
        },
        {
            name: "Sales",
            icon: (
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
            href: "/sales",
            permission: "create sales",
        },
        {
            name: "Purchases",
            icon: (
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
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
            ),
            href: "/purchases",
            permission: "create purchases",
        },
        {
            name: "Analytics",
            icon: (
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                </svg>
            ),
            href: "/analytics",
            permission: "view analytics",
        },
        {
            name: "Profit Reports",
            icon: (
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
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                </svg>
            ),
            href: "/profit-reports",
            permission: "view profit reports",
        },
        {
            name: "Users",
            icon: (
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            ),
            href: "/users",
            permission: "manage users",
        },
    ];

    // Filter navigation items based on permissions
    const visibleNavigationItems = navigationItems.filter(
        (item) => !item.permission || can(item.permission),
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-20 ${sidebarOpen ? "w-64" : "w-20"}`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    {sidebarOpen && (
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                            <span className="font-semibold text-gray-800">
                                POS System
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-6">
                    {visibleNavigationItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                        >
                            <div className="flex items-center justify-center w-8">
                                {item.icon}
                            </div>
                            {sidebarOpen && (
                                <span className="ml-3 text-sm font-medium">
                                    {item.name}
                                </span>
                            )}
                            {!sidebarOpen && (
                                <div className="absolute left-20 hidden group-hover:block bg-gray-900 text-white text-sm px-2 py-1 rounded whitespace-nowrap z-30">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User Info & Logout (Bottom of Sidebar) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <div
                        className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"}`}
                    >
                        {sidebarOpen && (
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                        {auth.user.name?.charAt(0) || "U"}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {auth.user.name || "User"}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {auth.user.email}
                                    </p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => post("/logout")}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Logout"
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
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div
                className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}
            >
                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-6 py-4">
                        <h1 className="text-xl font-semibold text-gray-800">
                            Dashboard
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Welcome back, {auth.user.name || "User"}!
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Total Products */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                        Total Products
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-800">
                                        --
                                    </p>
                                </div>
                                <div className="bg-blue-100 rounded-lg p-2">
                                    <svg
                                        className="w-5 h-5 text-blue-600"
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

                        {/* Today's Sales */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                        Today's Sales
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-800">
                                        --
                                    </p>
                                </div>
                                <div className="bg-green-100 rounded-lg p-2">
                                    <svg
                                        className="w-5 h-5 text-green-600"
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

                        {/* Low Stock Items */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                        Low Stock Items
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-800">
                                        --
                                    </p>
                                </div>
                                <div className="bg-red-100 rounded-lg p-2">
                                    <svg
                                        className="w-5 h-5 text-red-600"
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

                    {/* Additional Info Section (Optional) */}
                    <div className="mt-6">
                        <p className="text-sm text-gray-400 text-center">
                            Dashboard overview - Update your data from the
                            sidebar menu
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
