import React, { useState } from "react";
import { usePage, useForm } from "@inertiajs/react";

export default function RolesIndex() {
    const { roles, permissions } = usePage().props;

    const [editingRole, setEditingRole] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        name: "",
        description: "",
        permissions: [],
    });

    /*
    |--------------------------------------------------------------------------
    | GROUP PERMISSIONS
    |--------------------------------------------------------------------------
    */

    const groupedPermissions = permissions.reduce((groups, permission) => {

        const group =
            permission.name.split(".")[0];

        if (!groups[group]) {
            groups[group] = [];
        }

        groups[group].push(permission);

        return groups;

    }, {});

    /*
    |--------------------------------------------------------------------------
    | TOGGLE PERMISSION
    |--------------------------------------------------------------------------
    */

    const togglePermission = (permissionName) => {

        if (data.permissions.includes(permissionName)) {

            setData(
                "permissions",
                data.permissions.filter(
                    (p) => p !== permissionName
                )
            );

        } else {

            setData(
                "permissions",
                [...data.permissions, permissionName]
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN CREATE
    |--------------------------------------------------------------------------
    */

    const openCreate = () => {

        reset();

        setEditingRole(null);

        setData({
            name: "",
            description: "",
            permissions: [],
        });

        setModalOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN EDIT
    |--------------------------------------------------------------------------
    */

    const openEdit = (role) => {

        setEditingRole(role);

        setData({
            name: role.name,
            description: role.description || "",
            permissions:
                role.permissions?.map(
                    (p) => p.name
                ) || [],
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

        if (editingRole) {

            put(`/roles/${editingRole.id}`, {

                preserveScroll: true,

                onSuccess: () => {
                    setModalOpen(false);
                },

            });

        } else {

            post("/roles", {

                preserveScroll: true,

                onSuccess: () => {
                    setModalOpen(false);
                },

            });
        }
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    const handleDelete = (role) => {

        if (
            !confirm(
                `Delete role ${role.name}?`
            )
        ) return;

        destroy(`/roles/${role.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* HEADER */}

                <div className="flex justify-between items-center mb-8">

                    <div>
                        <h1 className="text-2xl font-semibold">
                            Roles
                        </h1>

                        <p className="text-sm text-gray-500">
                            Manage roles and permissions
                        </p>
                    </div>

                    <button
                        onClick={openCreate}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        + Add Role
                    </button>

                </div>

                {/* TABLE */}

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

                    <table className="w-full">

                        <thead className="bg-gray-100">

                            <tr>
                                <th className="p-4 text-left">
                                    Role
                                </th>

                                <th className="text-left">
                                    Description
                                </th>

                                <th className="text-right p-4">
                                    Actions
                                </th>
                            </tr>

                        </thead>

                        <tbody>

                            {roles.map((role) => (

                                <tr
                                    key={role.id}
                                    className="border-t"
                                >

                                    <td className="p-4 font-medium">
                                        {role.name}
                                    </td>

                                    <td>
                                        {role.description}
                                    </td>

                                    <td className="p-4 text-right">

                                        <button
                                            onClick={() =>
                                                openEdit(role)
                                            }
                                            className="px-3 py-1 bg-gray-400 text-white rounded mr-2"
                                        >
                                            Edit
                                        </button>

                                        {role.name !== "Admin" && (
                                            <button
                                                onClick={() =>
                                                    handleDelete(role)
                                                }
                                                className="px-3 py-1 bg-red-500 text-white rounded"
                                            >
                                                Delete
                                            </button>
                                        )}

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

                    <div className="bg-white w-full max-w-2xl rounded-xl p-6 max-h-[90vh] overflow-y-auto">

                        <h2 className="text-xl font-semibold mb-6">

                            {editingRole
                                ? "Edit Role"
                                : "Create Role"}

                        </h2>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* NAME */}

                            <div>

                                <label className="block text-sm mb-1">
                                    Role Name
                                </label>

                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData(
                                            "name",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border rounded p-2"
                                />

                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.name}
                                    </p>
                                )}

                            </div>

                            {/* DESCRIPTION */}

                            <div>

                                <label className="block text-sm mb-1">
                                    Description
                                </label>

                                <textarea
                                    rows="3"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border rounded p-2"
                                />

                            </div>

                            {/* PERMISSIONS */}

                            <div>

                                <label className="block text-sm font-medium mb-3">
                                    Permissions
                                </label>

                                <div className="space-y-5">

                                    {Object.entries(groupedPermissions).map(
                                        ([group, perms]) => (

                                            <div
                                                key={group}
                                                className="border rounded-lg p-4"
                                            >

                                                <h3 className="font-semibold capitalize mb-3">
                                                    {group}
                                                </h3>

                                                <div className="grid grid-cols-2 gap-2">

                                                    {perms.map((permission) => (

                                                        <label
                                                            key={permission.id}
                                                            className="flex items-center gap-2 text-sm"
                                                        >

                                                            <input
                                                                type="checkbox"
                                                                checked={data.permissions.includes(
                                                                    permission.name
                                                                )}
                                                                onChange={() =>
                                                                    togglePermission(
                                                                        permission.name
                                                                    )
                                                                }
                                                            />

                                                            {permission.name}

                                                        </label>

                                                    ))}

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                            {/* ACTIONS */}

                            <div className="flex justify-end gap-2 pt-3">

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