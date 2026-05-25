import { usePage, Link, useForm, router } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const permissions = user.permissions;

    const { post } = useForm();

    // ===== SIDEBAR STATE =====
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ===== SESSION LOGIC =====
    const [showWarning, setShowWarning] = useState(false);
    const timeoutRef = useRef(null);
    const warningRef = useRef(null);

    const WARNING_TIME = 60 * 1000;

    const getTimeout = () => {
        const role = user?.roles?.[0];
        if (role === "Admin") return 10 * 60 * 1000;
        return 60 * 60 * 1000;
    };

    const autoSave = () => {
        const forms = document.querySelectorAll("form[data-autosave]");
        const unsavedForms = JSON.parse(
            localStorage.getItem("unsaved_forms") || "{}",
        );

        forms.forEach((form) => {
            const formName = form.dataset.autosave;
            const data = {};
            new FormData(form).forEach((value, key) => {
                data[key] = value;
            });
            unsavedForms[formName] = data;
        });

        localStorage.setItem("unsaved_forms", JSON.stringify(unsavedForms));
    };

    const resetTimer = () => {
        setShowWarning(false);
        clearTimeout(timeoutRef.current);
        clearTimeout(warningRef.current);

        const totalTime = getTimeout();

        warningRef.current = setTimeout(() => {
            setShowWarning(true);
        }, totalTime - WARNING_TIME);

        timeoutRef.current = setTimeout(() => {
            autoSave();
            router.visit("/logout", { method: "post" });
        }, totalTime);
    };

    useEffect(() => {
        const events = ["click", "mousemove", "keypress"];
        events.forEach((e) => window.addEventListener(e, resetTimer));
        resetTimer();

        return () => {
            events.forEach((e) => window.removeEventListener(e, resetTimer));
            clearTimeout(timeoutRef.current);
            clearTimeout(warningRef.current);
        };
    }, []);

    // ===== PERMISSION HELPER =====
    const can = (permission) => permissions.includes(permission);

    // ===== UPDATED NAV ITEMS =====
  const navigationItems = [
    {
        name: "Dashboard",
        href: "/dashboard",
        permission: "dashboard.view",
        icon: "📊",
    },

    {
        name: "Products",
        href: "/products",
        permission: "products.view",
        icon: "📦",
    },

    {
        name: "Categories",
        href: "/categories",
        permission: "categories.manage",
        icon: "🗂",
    },

    {
        name: "Sales",
        href: "/sales",
        permission: "sales.view",
        icon: "💰",
    },

    {
        name: "Purchases",
        href: "/purchases",
        permission: "purchases.view",
        icon: "🛒",
    },

    {
        name: "Suppliers",
        href: "/suppliers",
        permission: "suppliers.manage",
        icon: "🚚",
    },

    {
        name: "Stock Adjustment",
        href: "/stock-adjustments/create",
        permission: "stock.manage",
        icon: "📈",
    },

    {
        name: "Analytics",
        href: "/analytics",
        permission: "analytics.view",
        icon: "📉",
    },

    {
        name: "Profit Reports",
        href: "/profit",
        permission: "reports.profit.view",
        icon: "📑",
    },

    {
        name: "Users",
        href: "/users",
        permission: "users.view",
        icon: "👥",
    },

    {
        name: "Roles",
        href: "/roles",
        permission: "users.view",
        icon: "🛡",
    },

    {
        name: "Activity Logs",
        href: "/activity-logs",
        permission: "users.view",
        icon: "📜",
    },
];
    const visibleNavigationItems = navigationItems.filter(
        (item) => !item.permission || can(item.permission),
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* WARNING */}
            {showWarning && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded shadow z-50">
                    ⚠ Session expiring in 1 minute!
                    <button
                        onClick={resetTimer}
                        className="ml-3 bg-white text-red-500 px-2 py-1 rounded"
                    >
                        Stay
                    </button>
                </div>
            )}

            {/* ===== SIDEBAR ===== */}
            <aside
                className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-20 flex flex-col ${
                    sidebarOpen ? "w-64" : "w-20"
                }`}
            >
                {/* Header */}
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
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        ☰
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-6 flex-1 overflow-y-auto">
                    {visibleNavigationItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition group relative"
                        >
                            <div className="flex items-center justify-center w-8">
                                <span className="text-lg">{item.icon}</span>
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

                {/* Bottom User */}
                <div className="p-4 border-t border-gray-200">
                    <div
                        className={`flex items-center ${
                            sidebarOpen ? "justify-between" : "justify-center"
                        }`}
                    >
                        {sidebarOpen ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                        {user.name?.charAt(0) || "U"}
                                    </span>
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                    {user.name?.charAt(0) || "U"}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={() => post("/logout")}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h10v16H4z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 12h6m0 0l-2-2m2 2l-2 2" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ===== MAIN ===== */}
            <div
                className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}
            >
                <div className="bg-white border-b px-6 py-6">
                    {header ? (
                        header
                    ) : (
                        <h1 className="text-lg font-semibold">
                            Welcome, {user.name}
                        </h1>
                    )}
                </div>

                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}