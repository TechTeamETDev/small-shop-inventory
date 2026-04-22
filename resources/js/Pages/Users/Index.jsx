import React, { useState, useEffect } from "react";
import { usePage, useForm } from "@inertiajs/react";

export default function UsersIndex() {
    const { users: initialUsers, roles } = usePage().props;

    const [editingUser, setEditingUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formErrors, setFormErrors] = useState({});
    const [formMessage, setFormMessage] = useState("");

    const validateForm = () => {
        const errors = {};

        if (!data.name || !data.name.trim()) {
            errors.name = "Name is required";
        }

        if (!data.email || !data.email.trim()) {
            errors.email = "Email is required";
        }

        if (!editingUser && (!data.password || !data.password.trim())) {
            errors.password = "Password is required";
        }

        if (data.password && data.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }

        if (data.password !== data.password_confirmation) {
            errors.password_confirmation = "Passwords do not match";
        }

        if (!data.role) {
            errors.role = "Role is required";
        }

        return errors;
    };
    const emptyForm = {
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: roles[0]?.name || "",
    };

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        processing,
        errors,
    } = useForm(emptyForm);

    // 🔥 IMPORTANT: hard reset when modal closes
    useEffect(() => {
        if (!modalOpen) {
            setEditingUser(null);
            reset();
        }
    }, [modalOpen]);

    // ================= CREATE =================
    const openCreate = () => {
        setEditingUser(null);

        setShowPassword(false);
        setShowConfirmPassword(false);

        reset(emptyForm); // full clean reset
        setData(emptyForm); // force overwrite stale values

        setModalOpen(true);
    };

    // ================= EDIT =================
    const openEdit = (user) => {
        setEditingUser(user);

        setShowPassword(false);
        setShowConfirmPassword(false);

        reset(); // clear old state first

        setData({
            name: user.name || "",
            email: user.email || "",
            password: "",
            password_confirmation: "",
            role: user.roles?.[0]?.name || "",
        });

        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const errors = validateForm();

        setFormErrors(errors);

        // ❗ THIS IS THE KEY PART
        if (Object.keys(errors).length > 0) {
            setFormMessage("Please fill all required fields correctly.");
            return; // STOP submit
        }

        setFormMessage("");
        setFormErrors({});

        if (editingUser) {
            put(`/users/${editingUser.id}`, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post("/users", {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (user) => {
        if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
        destroy(`/users/${user.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* HEADER */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Users
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage system users and roles
                        </p>
                    </div>

                    <button
                        onClick={openCreate}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        + Add User
                    </button>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 text-left text-sm">
                            <tr>
                                <th className="p-4">User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th className="text-right p-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {initialUsers.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="p-4">{user.name}</td>
                                    <td>{user.email}</td>

                                    <td>
                                        {user.roles.map((r) => (
                                            <span
                                                key={r.id}
                                                className="text-xs bg-gray-200 px-2 py-1 rounded mr-1"
                                            >
                                                {r.name}
                                            </span>
                                        ))}
                                    </td>

                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => openEdit(user)}
                                            className="px-3 py-1 bg-yellow-400 rounded mr-2"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(user)}
                                            className="px-3 py-1 bg-red-500 text-white rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}

            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white w-full max-w-md rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">
                            {editingUser ? "Edit User" : "Add User"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* NAME */}
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            />

                            {formErrors.name && (
                                <p className="text-red-500 text-sm">
                                    {formErrors.name}
                                </p>
                            )}

                            {/* EMAIL (ANTI AUTOFILL FIX) */}
                            <input
                                type="email"
                                placeholder="Email"
                                autoComplete="new-email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                className="w-full border p-2 rounded"
                            />
                            {formErrors.email && (
                                <p className="text-red-500 text-sm">
                                    {formErrors.email}
                                </p>
                            )}

                            {/* PASSWORD */}
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                className="w-full border p-2 rounded"
                            />
                            {formErrors.password && (
                                <p className="text-red-500 text-sm">
                                    {formErrors.password}
                                </p>
                            )}

                            {/* CONFIRM PASSWORD */}
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        "password_confirmation",
                                        e.target.value,
                                    )
                                }
                                className="w-full border p-2 rounded"
                            />
                            {formErrors.password_confirmation && (
                                <p className="text-red-500 text-sm">
                                    {formErrors.password_confirmation}
                                </p>
                            )}

                            {/* ROLE */}
                            <select
                                value={data.role}
                                onChange={(e) =>
                                    setData("role", e.target.value)
                                }
                                className="w-full border p-2 rounded"
                            >
                                {roles.map((r) => (
                                    <option key={r.id} value={r.name}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                            {formErrors.role && (
                                <p className="text-red-500 text-sm">
                                    {formErrors.role}
                                </p>
                            )}

                            {/* BUTTONS */}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
