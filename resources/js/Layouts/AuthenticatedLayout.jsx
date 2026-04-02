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
        if (role === "Admin") return 10 * 60 * 1000; // 2 minutes
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
