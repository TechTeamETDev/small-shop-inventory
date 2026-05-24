import React, { useState, useEffect } from "react";
import { usePage, useForm } from "@inertiajs/react";

export default function UsersIndex() {
    const { users, roles } = usePage().props;

    const [editingUser, setEditingUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const emptyForm = {
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "",
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

    /*
    |--------------------------------------------------------------------------
    | DEFAULT ROLE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (roles?.length && !data.role && !editingUser) {
            setData("role", roles[0].name);
        }
    }, [roles]);

    /*
    |--------------------------------------------------------------------------
    | RESET MODAL
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!modalOpen) {
            setEditingUser(null);
            reset();
        }
    }, [modalOpen]);

    /*
    |--------------------------------------------------------------------------
    | OPEN CREATE
    |--------------------------------------------------------------------------
    */

    const openCreate = () => {
        setEditingUser(null);

        reset();

        setData({
            ...emptyForm,
            role: roles?.[0]?.name || "",
        });

        setModalOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN EDIT
    |--------------------------------------------------------------------------
    */

    const openEdit = (user) => {
        setEditingUser(user);

        setData({
            name: user.name || "",
            email: user.email || "",
            password: "",
            password_confirmation: "",
            role: user.roles?.[0]?.name || "",
        });

        setModalOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingUser) {
            put(`/users/${editingUser.id}`, {
                preserveScroll: true,

                onSuccess: () => {
                    setModalOpen(false);
                },

                onError: (errors) => {
                    console.log(errors);
                },
            });
        } else {
            post("/users", {
                preserveScroll: true,

                onSuccess: () => {
                    setModalOpen(false);
                },

                onError: (errors) => {
                    console.log(errors);
                },
            });
        }
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    const handleDelete = (user) => {
        if (!confirm(`Delete ${user.name}?`)) return;

        destroy(`/users/${user.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* HEADER */}

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Users
                        </h1>

                        <p className="text-sm text-gray-500">
                            Manage system users
                        </p>
                    </div>

                    <button
                        onClick={openCreate}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        + Add User
                    </button>
                </div>

                {/* TABLE */}

                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 text-left text-sm">
                            <tr>
                                <th className="p-4">Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th className="text-right p-4">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {users?.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-t"
                                >
                                    <td className="p-4">
                                        {user.name}
                                    </td>

                                    <td>{user.email}</td>

                                    <td>
                                        {user.roles?.map((role) => (
                                            <span
                                                key={role.id}
                                                className="text-xs bg-gray-200 px-2 py-1 rounded mr-1"
                                            >
                                                {role.name}
                                            </span>
                                        ))}
                                    </td>

                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => openEdit(user)}
                                            className="px-3 py-1 bg-gray-400 text-white rounded mr-2"
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-xl p-6">

                        <h2 className="text-lg font-semibold mb-4">
                            {editingUser
                                ? "Edit User"
                                : "Add User"}
                        </h2>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >

                            {/* NAME */}

                            <div>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="w-full border p-2 rounded"
                                />

                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* EMAIL */}

                            <div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="w-full border p-2 rounded"
                                />

                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* PASSWORD */}

                            <div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="w-full border p-2 rounded"
                                />

                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* CONFIRM PASSWORD */}

                            <div>
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            {/* ROLE */}

                            <div>
                                <select
                                    value={data.role}
                                    onChange={(e) =>
                                        setData("role", e.target.value)
                                    }
                                    className="w-full border p-2 rounded"
                                >
                                    <option value="">
                                        Select Role
                                    </option>

                                    {roles?.map((role) => (
                                        <option
                                            key={role.id}
                                            value={role.name}
                                        >
                                            {role.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.role && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            {/* ACTIONS */}

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setModalOpen(false)
                                    }
                                    className="px-4 py-2 bg-gray-200 rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    {processing
                                        ? "Saving..."
                                        : "Save"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}