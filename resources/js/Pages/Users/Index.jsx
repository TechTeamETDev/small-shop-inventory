import React, { useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";

export default function UsersIndex() {
    const { users: initialUsers, roles, permissions } = usePage().props;

    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [roleName, setRoleName] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const [editingUser, setEditingUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const emptyForm = {
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "",
    };

    const { data, setData, post, put, reset, processing } = useForm(emptyForm);

    const validateForm = () => {
        const errors = {};

        if (!data.name?.trim()) errors.name = "Name required";
        if (!data.email?.trim()) errors.email = "Email required";

        if (!editingUser && !data.password) {
            errors.password = "Password required";
        }

        if (data.password && data.password.length < 6) {
            errors.password = "Min 6 characters";
        }

        if (data.password !== data.password_confirmation) {
            errors.password_confirmation = "Passwords do not match";
        }

        if (!data.role) errors.role = "Role required";

        return errors;
    };

    const openCreate = () => {
        setEditingUser(null);
        reset();
        setFormErrors({});
        setModalOpen(true);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setFormErrors({});

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

        if (Object.keys(errors).length > 0) return;

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
        if (!confirm("Delete user?")) return;
        router.delete(`/users/${user.id}`);
    };

    const saveRole = () => {
        if (!roleName.trim()) {
            alert("Role name is required");
            return;
        }

        router.post(
            "/roles",
            {
                name: roleName,
                permissions: selectedPermissions,
            },
            {
                onSuccess: () => {
                    setRoleModalOpen(false);
                    setRoleName("");
                    setSelectedPermissions([]);
                },
            },
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Users</h1>

                <div className="flex gap-2">
                    <button
                        onClick={() => setRoleModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        + Add Role
                    </button>

                    <button
                        onClick={openCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        + Add User
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Role</th>
                            <th className="text-left p-2">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {initialUsers.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="p-2">{user.name}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2">
                                    {user.roles.map((r) => r.name).join(", ")}
                                </td>
                                <td className="p-2 space-x-3">
                                    <button
                                        onClick={() => openEdit(user)}
                                        className="text-blue-600"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(user)}
                                        className="text-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white w-full max-w-md p-6 rounded-lg">
                        <h2 className="text-lg font-bold mb-4">
                            {editingUser ? "Edit User" : "Create User"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="w-full border p-2"
                                />
                                {formErrors.name && (
                                    <p className="text-red-600 text-sm">
                                        {formErrors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="w-full border p-2"
                                />
                                {formErrors.email && (
                                    <p className="text-red-600 text-sm">
                                        {formErrors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="w-full border p-2"
                                />
                                {formErrors.password && (
                                    <p className="text-red-600 text-sm">
                                        {formErrors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border p-2"
                                />
                                {formErrors.password_confirmation && (
                                    <p className="text-red-600 text-sm">
                                        {formErrors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            <div>
                                <select
                                    value={data.role}
                                    onChange={(e) =>
                                        setData("role", e.target.value)
                                    }
                                    className="w-full border p-2"
                                >
                                    <option value="">Select Role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.role && (
                                    <p className="text-red-600 text-sm">
                                        {formErrors.role}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-3 py-1 bg-gray-300"
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={processing}
                                    className="px-3 py-1 bg-blue-600 text-white"
                                >
                                    {processing ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {roleModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white w-full max-w-md p-6 rounded-lg">
                        <h2 className="text-lg font-bold mb-4">Create Role</h2>

                        <input
                            type="text"
                            placeholder="Role name"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className="w-full border p-2 mb-3"
                        />

                        <div className="max-h-60 overflow-y-auto border p-2">
                            {permissions.map((p) => (
                                <label key={p.id} className="block py-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes(
                                            p.name,
                                        )}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedPermissions([
                                                    ...selectedPermissions,
                                                    p.name,
                                                ]);
                                            } else {
                                                setSelectedPermissions(
                                                    selectedPermissions.filter(
                                                        (x) => x !== p.name,
                                                    ),
                                                );
                                            }
                                        }}
                                    />
                                    <span className="ml-2">{p.name}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setRoleModalOpen(false)}
                                className="px-3 py-1 bg-gray-300"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={saveRole}
                                className="px-3 py-1 bg-blue-600 text-white"
                            >
                                Save Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}