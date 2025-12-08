import { useState, useEffect } from 'react';
import { examSectionNamesAPI } from '../../service/api.js';
import { Layout } from '../layout/Layout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const ExamSectionNamesPage = () => {
    const { hasRole } = useAuth();
    const [sections, setSections] = useState([]);
    const [filteredSections, setFilteredSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showUsageModal, setShowUsageModal] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);

    useEffect(() => {
        fetchSections();
    }, []);

    useEffect(() => {
        filterSections();
    }, [searchTerm, statusFilter, sections]);

    const fetchSections = async () => {
        try {
            const response = await examSectionNamesAPI.getAll();
            // Sort by section date (most recent first)
            const sorted = (response.data || []).sort((a, b) =>
                new Date(b.sectionDate) - new Date(a.sectionDate)
            );
            setSections(sorted);
        } catch (error) {
            console.error('Error fetching exam sections:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterSections = () => {
        let filtered = [...sections];

        // Status filter
        if (statusFilter !== 'All') {
            filtered = filtered.filter(s =>
                statusFilter === 'Active' ? s.isActive : !s.isActive
            );
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(term) ||
                (s.description && s.description.toLowerCase().includes(term))
            );
        }

        setFilteredSections(filtered);
    };

    const handleToggleActive = async (section) => {
        if (!hasRole(['Admin', 'SuperAdmin'])) return;

        const action = section.isActive ? 'deactivate' : 'activate';
        if (!confirm(`Are you sure you want to ${action} "${section.name}"?`)) return;

        try {
            await examSectionNamesAPI.toggleActive(section.id);
            alert(`Section ${action}d successfully!`);
            await fetchSections();
        } catch (error) {
            alert('Error toggling section status: ' + (error.message || 'Unknown error'));
        }
    };

    const handleDelete = async (section) => {
        if (!hasRole(['Admin', 'SuperAdmin'])) return;

        const warningMessage = section.usageCount > 0
            ? `Warning: This section is used in ${section.usageCount} registration(s).\n\nAre you sure you want to delete "${section.name}"?`
            : `Are you sure you want to delete "${section.name}"?`;

        if (!confirm(warningMessage)) return;

        try {
            await examSectionNamesAPI.delete(section.id);
            alert('Section deleted successfully!');
            await fetchSections();
        } catch (error) {
            alert('Error deleting section: ' + (error.message || 'Unknown error'));
        }
    };

    const handleViewUsage = (section) => {
        setSelectedSection(section);
        setShowUsageModal(true);
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
                        <h1 className="text-3xl font-bold">Exam Section Names</h1>
                        <p className="text-base-content/60 mt-2">
                            Manage AP exam sections and schedules
                        </p>
                    </div>
                    {hasRole(['Admin', 'SuperAdmin']) && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn btn-primary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Section
                        </button>
                    )}
                </div>

                {/* Filters and Search */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="form-control flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by name or description..."
                                    className="input input-bordered w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="form-control">
                                <select
                                    className="select select-bordered"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">All Status</option>
                                    <option value="Active">Active Only</option>
                                    <option value="Inactive">Inactive Only</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sections Table */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                <tr>
                                    <th>Section Name</th>
                                    <th>Description</th>
                                    <th>Section Date</th>
                                    <th>Status</th>
                                    <th>Usage Count</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredSections.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8">
                                            No exam sections found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSections.map((section) => (
                                        <tr key={section.id}>
                                            <td className="font-medium">{section.name}</td>
                                            <td className="max-w-xs truncate">
                                                {section.description || '-'}
                                            </td>
                                            <td>{formatDate(section.sectionDate)}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <span className={`badge ${section.isActive ? 'badge-success' : 'badge-ghost'}`}>
                                                        {section.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {hasRole(['Admin', 'SuperAdmin']) && (
                                                        <input
                                                            type="checkbox"
                                                            className="toggle toggle-success toggle-sm"
                                                            checked={section.isActive}
                                                            onChange={() => handleToggleActive(section)}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {section.usageCount > 0 ? (
                                                    <button
                                                        onClick={() => handleViewUsage(section)}
                                                        className="badge badge-info cursor-pointer hover:badge-info-focus"
                                                    >
                                                        {section.usageCount} registration{section.usageCount !== 1 ? 's' : ''}
                                                    </button>
                                                ) : (
                                                    <span className="text-base-content/60">0</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    {hasRole(['Admin', 'SuperAdmin']) && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSection(section);
                                                                    setShowEditModal(true);
                                                                }}
                                                                className="btn btn-xs btn-ghost"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(section)}
                                                                className="btn btn-xs btn-error btn-ghost"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
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

                {/* Create Section Modal */}
                {showCreateModal && hasRole(['Admin', 'SuperAdmin']) && (
                    <CreateSectionModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            fetchSections();
                        }}
                    />
                )}

                {/* Edit Section Modal */}
                {showEditModal && selectedSection && hasRole(['Admin', 'SuperAdmin']) && (
                    <EditSectionModal
                        section={selectedSection}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedSection(null);
                        }}
                        onSuccess={() => {
                            setShowEditModal(false);
                            setSelectedSection(null);
                            fetchSections();
                        }}
                    />
                )}

                {/* Usage Modal */}
                {showUsageModal && selectedSection && (
                    <UsageModal
                        section={selectedSection}
                        onClose={() => {
                            setShowUsageModal(false);
                            setSelectedSection(null);
                        }}
                    />
                )}
            </div>
        </Layout>
    );
};

// Create Section Modal Component
const CreateSectionModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sectionDate: '',
        isActive: true,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await examSectionNamesAPI.create(formData);
            alert('Section created successfully!');
            onSuccess();
        } catch (error) {
            alert('Error creating section: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Create New Exam Section</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <div className="grid grid-cols-[30%_70%] gap-2 items-center">
                            <label className="label">
                                <span className="label-text">Section Name *</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                maxLength={100}
                                disabled={loading}
                                placeholder="e.g., Week 1: Monday, European History"
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <div className="grid grid-cols-[30%_70%] gap-2 items-start">
                            <label className="label">
                                <span className="label-text">Description</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                maxLength={200}
                                disabled={loading}
                                rows="2"
                                placeholder="Optional description"
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <div className="grid grid-cols-[30%_70%] gap-2 items-center">
                            <label className="label">
                                <span className="label-text">Section Date *</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered"
                                value={formData.sectionDate}
                                onChange={(e) => setFormData({ ...formData, sectionDate: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <div className="grid grid-cols-[30%_70%] gap-2 items-center">
                            <label className="label">
                                <span className="label-text">Active</span>
                            </label>
                            <div>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Section'}
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

// Edit Section Modal Component
const EditSectionModal = ({ section, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: section.name,
        description: section.description || '',
        sectionDate: section.sectionDate.split('T')[0],
        isActive: section.isActive,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await examSectionNamesAPI.update(section.id, formData);
            alert('Section updated successfully!');
            onSuccess();
        } catch (error) {
            alert('Error updating section: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Edit Exam Section</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <div className="grid grid-cols-[30%_70%] gap-2 items-center">
                            <label className="label">
                                <span className="label-text">Section Name *</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                maxLength={100}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <div className="grid grid-cols-[30%_70%] gap-2 items-start">
                            <label className="label">
                                <span className="label-text">Description</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                maxLength={200}
                                disabled={loading}
                                rows="2"
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <div className="grid grid-cols-[30%_70%] gap-2 items-center">
                            <label className="label">
                                <span className="label-text">Section Date *</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered"
                                value={formData.sectionDate}
                                onChange={(e) => setFormData({ ...formData, sectionDate: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <div className="grid grid-cols-[30%_70%] gap-2 items-center">
                            <label className="label">
                                <span className="label-text">Active</span>
                            </label>
                            <div>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {section.usageCount > 0 && (
                        <div className="alert alert-warning">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>This section is used in {section.usageCount} registration(s)</span>
                        </div>
                    )}

                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Section'}
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

// Usage Modal Component
const UsageModal = ({ section, onClose }) => {
    return (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Section Usage: {section.name}</h3>
                <div className="space-y-4">
                    <div className="stats shadow w-full">
                        <div className="stat">
                            <div className="stat-title">Total Registrations</div>
                            <div className="stat-value text-primary">{section.usageCount}</div>
                            <div className="stat-desc">Students registered for this section</div>
                        </div>
                    </div>

                    <div className="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>To view the list of students, go to the Registrations page and filter by this exam section.</span>
                    </div>
                </div>

                <div className="modal-action">
                    <button onClick={onClose} className="btn">Close</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button>close</button>
            </form>
        </dialog>
    );
};