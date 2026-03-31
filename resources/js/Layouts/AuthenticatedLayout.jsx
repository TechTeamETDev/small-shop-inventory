import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import { Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [showWarning, setShowWarning] = useState(false);
    const timeoutRef = useRef(null);
    const warningRef = useRef(null);

    const WARNING_TIME = 60 * 1000; // 1 min

    const getTimeout = () => {
        const role = user?.roles?.[0];
        if (role === "Admin") return 2 * 60 * 1000; // 2 minutes
        return 60 * 60 * 1000; // 1 hour for employees
    };

    const autoSave = () => {
        // Save form data to localStorage instead of POST
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
        console.log("💾 Auto-saved forms to localStorage");
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
            autoSave(); // Save before logout
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

    return (
        <div className="min-h-screen bg-gray-100">
            {showWarning && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded shadow">
                    ⚠ Session expiring in 1 minute!
                    <button
                        onClick={resetTimer}
                        className="ml-3 bg-white text-red-500 px-2 py-1 rounded"
                    >
                        Stay
                    </button>
                </div>
            )}

            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            </Link>
                            <div className="hidden sm:flex sm:space-x-8 sm:ml-10">
                                <NavLink
                                    href={route("dashboard")}
                                    active={route().current("dashboard")}
                                >
                                    Dashboard
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                                        >
                                            {user?.name}
                                            <svg
                                                className="ml-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route("profile.edit")}>
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
