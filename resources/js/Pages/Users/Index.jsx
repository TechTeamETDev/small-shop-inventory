import React, { useState } from "react";
import { usePage, useForm } from "@inertiajs/react";

export default function UsersIndex() {
    const { users: initialUsers, roles } = usePage().props;

    const [editingUser, setEditingUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // password visibility states (UI ONLY)
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        processing,
        errors,
    } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: roles[0]?.name || "",
    });

    const openCreate = () => {
        reset();
        setEditingUser(null);
        setModalOpen(true);
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: "",
            password_confirmation: "",
            role: user.roles[0]?.name || "",
        });
        setModalOpen(true);
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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
                {/* Header */}
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
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        + Add User
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-lg shadow-sm border">
                        <p className="text-sm text-gray-500">Total Users</p>
                        <p className="text-xl font-semibold">
                            {initialUsers.length}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-lg shadow-sm border">
                        <p className="text-sm text-gray-500">Roles</p>
                        <p className="text-xl font-semibold">{roles.length}</p>
                    </div>

                    <div className="bg-white p-5 rounded-lg shadow-sm border">
                        <p className="text-sm text-gray-500">Active</p>
                        <p className="text-xl font-semibold">
                            {initialUsers.length}
                        </p>
                    </div>
                </div>

                {/* Table */}
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
                                <tr
                                    key={user.id}
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="p-4 font-medium">
                                        {user.name}
                                    </td>

                                    <td className="text-gray-600">
                                        {user.email}
                                    </td>

                                    <td>
                                        <div className="flex gap-2 flex-wrap">
                                            {user.roles.map((r) => (
                                                <span
                                                    key={r.id}
                                                    className="text-xs bg-gray-200 px-2 py-1 rounded"
                                                >
                                                    {r.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(user)}
                                                className="px-3 py-1 text-sm bg-yellow-400 rounded hover:bg-yellow-500"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(user)
                                                }
                                                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {initialUsers.length === 0 && (
                        <div className="p-10 text-center text-gray-500">
                            No users found
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 bg-gray-900">
                            <h2 className="text-white text-lg font-semibold">
                                {editingUser ? "Edit User" : "Add New User"}
                            </h2>
                            <p className="text-gray-300 text-sm">
                                {editingUser
                                    ? "Update user details below"
                                    : "Fill in details to create a new user"}
                            </p>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Name */}
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">
                                    {errors.name}
                                </p>
                            )}

                            {/* Email */}
                            <input
                                type="email"
                                placeholder="Email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">
                                    {errors.email}
                                </p>
                            )}

                            {/* Password */}
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={
                                        editingUser
                                            ? "New Password (optional)"
                                            : "Password"
                                    }
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="w-full border rounded-lg px-3 py-2 pr-16"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    className="absolute right-3 top-2 text-sm text-gray-500"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            {errors.password && (
                                <p className="text-red-500 text-sm">
                                    {errors.password}
                                </p>
                            )}

                            {/* Confirm Password */}
                            <div className="relative">
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Confirm Password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border rounded-lg px-3 py-2 pr-16"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword((prev) => !prev)
                                    }
                                    className="absolute right-3 top-2 text-sm text-gray-500"
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            {/* Role */}
                            <select
                                value={data.role}
                                onChange={(e) =>
                                    setData("role", e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            >
                                {roles.map((role) => (
                                    <option key={role.id} value={role.name}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-200"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                                >
                                    {editingUser
                                        ? "Update User"
                                        : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
