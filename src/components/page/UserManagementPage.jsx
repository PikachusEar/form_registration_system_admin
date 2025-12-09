import { useState, useEffect } from 'react';
import { adminUserAPI } from '../../service/api.js';
import { Layout } from '../layout/Layout.jsx';

export const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await adminUserAPI.getAll();
            setUsers(response || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId, username) => {
        if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

        try {
            await adminUserAPI.delete(userId);
            alert('User deleted successfully');
            await fetchUsers();
        } catch (error) {
            alert('Error deleting user: ' + (error.message || 'Unknown error'));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-96">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="text-base-content/60 mt-2">
                            Manage admin users and their permissions
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create User
                    </button>
                </div>

                {/* Users Table */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Last Login</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="font-medium">{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>
                          <span className={`badge ${
                              user.role === 'SuperAdmin' ? 'badge-error' :
                                  user.role === 'Admin' ? 'badge-warning' :
                                      'badge-info'
                          }`}>
                            {user.role}
                          </span>
                                            </td>
                                            <td>
                          <span className={`badge ${user.isActive ? 'badge-success' : 'badge-ghost'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                                            </td>
                                            <td className="text-sm">{formatDate(user.createdAt)}</td>
                                            <td className="text-sm">
                                                {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowEditModal(true);
                                                        }}
                                                        className="btn btn-xs btn-ghost"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowPasswordModal(true);
                                                        }}
                                                        className="btn btn-xs btn-ghost"
                                                    >
                                                        Password
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id, user.username)}
                                                        className="btn btn-xs btn-error btn-ghost"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Create User Modal */}
                {showCreateModal && (
                    <CreateUserModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            fetchUsers();
                        }}
                    />
                )}

                {/* Edit User Modal */}
                {showEditModal && selectedUser && (
                    <EditUserModal
                        user={selectedUser}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedUser(null);
                        }}
                        onSuccess={() => {
                            setShowEditModal(false);
                            setSelectedUser(null);
                            fetchUsers();
                        }}
                    />
                )}

                {/* Update Password Modal */}
                {showPasswordModal && selectedUser && (
                    <UpdatePasswordModal
                        user={selectedUser}
                        onClose={() => {
                            setShowPasswordModal(false);
                            setSelectedUser(null);
                        }}
                        onSuccess={() => {
                            setShowPasswordModal(false);
                            setSelectedUser(null);
                        }}
                    />
                )}
            </div>
        </Layout>
    );
};

// Create User Modal Component
const CreateUserModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'Viewer',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const currentUser = JSON.parse(localStorage.getItem('adminUser'));
            await adminUserAPI.create({
                ...formData,
                createdBy: currentUser?.username || 'SuperAdmin',
            });
            alert('User created successfully!');
            onSuccess();
        } catch (error) {
            alert('Error creating user: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Create New User</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Username</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            type="email"
                            className="input input-bordered"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Password</span>
                        </label>
                        <input
                            type="password"
                            className="input input-bordered"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={8}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Role</span>
                        </label>
                        <select
                            className="select select-bordered"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            disabled={loading}
                        >
                            <option value="Viewer">Viewer</option>
                            <option value="Admin">Admin</option>
                            <option value="SuperAdmin">SuperAdmin</option>
                        </select>
                    </div>

                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button>close</button>
            </form>
        </dialog>
    );
};

// Edit User Modal Component
const EditUserModal = ({ user, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await adminUserAPI.update(user.id, {
                id: user.id,
                ...formData,
            });
            alert('User updated successfully!');
            onSuccess();
        } catch (error) {
            alert('Error updating user: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Edit User</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <div className="grid grid-cols-[25%_75%] gap-2 items-center"><label className="label">
                            <span className="label-text">Username</span>
                        </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                disabled={loading}
                            /></div>
                    </div>

                    <div className="form-control">
                        <div className="grid grid-cols-[25%_75%] gap-2 items-center"><label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            type="email"
                            className="input input-bordered"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={loading}
                        /></div>
                    </div>

                    <div className="form-control">
                        <div className="grid grid-cols-[25%_75%] gap-2 items-center"><label className="label">
                            <span className="label-text">Role</span>
                        </label>
                            <select
                                className="select select-bordered"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                disabled={loading}
                            >
                                <option value="Viewer">Viewer</option>
                                <option value="Admin">Admin</option>
                                <option value="SuperAdmin">SuperAdmin</option>
                            </select></div>
                    </div>

                    <div className="form-control">
                        <label className="label cursor-pointer">
                            <span className="label-text">Active</span>
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                disabled={loading}
                            />
                        </label>
                    </div>

                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update User'}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button>close</button>
            </form>
        </dialog>
    );
};

// Update Password Modal Component
const UpdatePasswordModal = ({ user, onClose, onSuccess }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await adminUserAPI.updatePassword(user.id, newPassword);
            alert('Password updated successfully!');
            onSuccess();
        } catch (error) {
            alert('Error updating password: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Update Password for {user.username}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <div className="grid grid-cols-[30%_70%] gap-2 items-center"><label className="label">
                            <span className="label-text">New Password</span>
                        </label>
                            <input
                                type="password"
                                className="input input-bordered"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                                disabled={loading}
                            /></div>
                    </div>

                    <div className="form-control">
                        <div className="grid grid-cols-[30%_70%] gap-2 items-center"><label className="label">
                            <span className="label-text">Confirm Password</span>
                        </label>
                            <input
                                type="password"
                                className="input input-bordered"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                                disabled={loading}
                            /></div>
                    </div>

                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button>close</button>
            </form>
        </dialog>
    );
};