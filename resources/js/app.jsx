import "../css/app.css";
import "./bootstrap";
import { ZiggyVue } from '../../vendor/tightenco/ziggy';
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx"),
        ).then((page) => {
            // ❗ Skip auth pages
            if (!name.startsWith("Auth/")) {
                page.default.layout =
                    page.default.layout ||
                    ((page) => (
                        <AuthenticatedLayout>{page}</AuthenticatedLayout>
                    ));
            }

            return page;
        }),

    setup({ el, App, props }) {
        // -----------------------------
        // ✅ Global Axios interceptor
        // -----------------------------
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const formData = JSON.parse(
                    localStorage.getItem("form_data") || "{}",
                );

                if (
                    error.response?.status === 401 ||
                    error.response?.status === 419
                ) {
                    // Save form data to backend before logout
                    if (formData && formData.name) {
                        try {
                            await axios.post("/products", formData); // adjust endpoint if needed
                            console.log("Form autosaved before forced logout");
                        } catch (e) {
                            console.error(
                                "Failed to autosave before logout",
                                e,
                            );
                        }
                    }

                    // Redirect to login
                    window.location.href = "/login";
                }

                return Promise.reject(error);
            },
        );

        // -----------------------------
        // Render Inertia App
        // -----------------------------
        const root = createRoot(el);
        root.render(<App {...props} />);
    },

    progress: {
        color: "#4B5563",
    },
});
