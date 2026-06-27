import { useState } from "react";
import { router } from "@inertiajs/react";

export default function Roles({ roles, permissions }) {

    const [name, setName] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    function togglePermission(permission) {
        if (selectedPermissions.includes(permission)) {
            setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
        } else {
            setSelectedPermissions([...selectedPermissions, permission]);
        }
    }

    function submit(e) {
        e.preventDefault();

        router.post("/roles", {
            name,
            permissions: selectedPermissions
        });

        setName("");
        setSelectedPermissions([]);
    }

    return (
        <div className="p-6">

            <h1 className="text-xl font-bold mb-4">Role Management</h1>

            {/* CREATE ROLE FORM */}
            <form onSubmit={submit} className="bg-white p-4 rounded shadow mb-6">

                <input
                    type="text"
                    placeholder="Role name (e.g Storekeeper)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 w-full mb-4"
                />

                <h3 className="font-semibold mb-2">Permissions</h3>

                <div className="grid grid-cols-2 gap-2">
                    {permissions.map((perm) => (
                        <label key={perm.id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedPermissions.includes(perm.name)}
                                onChange={() => togglePermission(perm.name)}
                            />
                            {perm.name}
                        </label>
                    ))}
                </div>

                <button className="mt-4 bg-blue-600 text-white px-4 py-2">
                    Create Role
                </button>
            </form>

            {/* LIST ROLES */}
            <div className="bg-white p-4 rounded shadow">
                <h2 className="font-bold mb-2">Existing Roles</h2>

                {roles.map(role => (
                    <div key={role.id} className="border-b py-2">
                        <div className="font-semibold">{role.name}</div>
                        <div className="text-sm text-gray-600">
                            {role.permissions.map(p => p.name).join(", ")}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}