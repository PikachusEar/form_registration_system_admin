import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationAPI, examSectionNamesAPI } from '../../service/api.js';
import { Layout } from '../layout/Layout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const RegistrationsPage = () => {
    const { hasRole } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [examSectionFilter, setExamSectionFilter] = useState('All');
    const [examSections, setExamSections] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [processingBulk, setProcessingBulk] = useState(false);

    useEffect(() => {
        fetchRegistrations();
        fetchExamSections();
    }, []);

    useEffect(() => {
        filterRegistrations();
    }, [searchTerm, statusFilter, examSectionFilter, registrations]);

    const fetchRegistrations = async () => {
        try {
            const response = await registrationAPI.getAll();
            setRegistrations(response.data || []);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExamSections = async () => {
        try {
            const response = await examSectionNamesAPI.getAll();
            // Sort sections by name alphabetically
            const sorted = (response.data || []).sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            setExamSections(sorted);
        } catch (error) {
            console.error('Error fetching exam sections:', error);
        }
    };

    const filterRegistrations = () => {
        let filtered = [...registrations];

        // Status filter
        if (statusFilter !== 'All') {
            filtered = filtered.filter(r => r.paymentStatus === statusFilter);
        }

        // Exam Section filter
        if (examSectionFilter !== 'All') {
            filtered = filtered.filter(r =>
                    r.examSections && r.examSections.some(section =>
                        section.sectionNameId === examSectionFilter
                    )
            );
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                r.firstName.toLowerCase().includes(term) ||
                r.lastName.toLowerCase().includes(term) ||
                r.email.toLowerCase().includes(term) ||
                r.paymentCode.toLowerCase().includes(term)
            );
        }

        setFilteredRegistrations(filtered);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredRegistrations.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedIds.length === 0) return;

        if (!confirm(`Are you sure you want to change status of ${selectedIds.length} registration(s) to ${bulkAction}?`)) {
            return;
        }

        setProcessingBulk(true);
        try {
            const currentUser = JSON.parse(localStorage.getItem('adminUser'));
            await registrationAPI.bulkUpdateStatus({
                registrationIds: selectedIds,
                paymentStatus: bulkAction,
                updatedBy: currentUser?.username || 'Admin',
                notes: 'Bulk status update'
            });

            alert('Bulk update completed successfully!');
            setSelectedIds([]);
            setBulkAction('');
            await fetchRegistrations();
        } catch (error) {
            alert('Error performing bulk action: ' + (error.message || 'Unknown error'));
        } finally {
            setProcessingBulk(false);
        }
    };

    const handleDelete = async (reg) => {
        if (!hasRole(['Admin', 'SuperAdmin'])) return;

        if (!confirm(`Are you sure you want to delete the registration for "${reg.firstName} ${reg.lastName}"?`)) {
            return;
        }

        try {
            await registrationAPI.delete(reg.id);
            alert('Registration deleted successfully!');
            await fetchRegistrations();
        } catch (error) {
            alert('Error deleting registration: ' + (error.message || 'Unknown error'));
        }
    };

    const handleExport = async () => {
        try {
            await registrationAPI.exportCSV();
        } catch (error) {
            alert('Error exporting CSV: ' + (error.message || 'Unknown error'));
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
                        <h1 className="text-3xl font-bold">Registrations</h1>
                        <p className="text-base-content/60 mt-2">
                            {filteredRegistrations.length} registration(s) found
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="btn btn-outline btn-primary"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export CSV
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="form-control flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or payment code..."
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
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <select
                                    className="select select-bordered"
                                    value={examSectionFilter}
                                    onChange={(e) => setExamSectionFilter(e.target.value)}
                                    style={{
                                        maxHeight: '240px',
                                        overflowY: 'auto'
                                    }}
                                >
                                    <option value="All">All Exam Sections</option>
                                    {examSections.map((section) => (
                                        <option key={section.id} value={section.id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                {hasRole(['Admin', 'SuperAdmin']) && selectedIds.length > 0 && (
                    <div className="alert alert-info">
                        <div className="flex items-center gap-4 w-full">
                            <span>{selectedIds.length} item(s) selected</span>
                            <div className="flex gap-2 ml-auto">
                                <select
                                    className="select select-bordered select-sm"
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                >
                                    <option value="">Select Action</option>
                                    <option value="Confirmed">Mark as Confirmed</option>
                                    <option value="Pending">Mark as Pending</option>
                                    <option value="Cancelled">Mark as Cancelled</option>
                                </select>
                                <button
                                    onClick={handleBulkAction}
                                    className="btn btn-sm btn-primary"
                                    disabled={!bulkAction || processingBulk}
                                >
                                    {processingBulk ? 'Processing...' : 'Apply'}
                                </button>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="btn btn-sm btn-ghost"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Registrations Table */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra text-center">
                                <thead>
                                <tr>
                                    {hasRole(['Admin', 'SuperAdmin']) && (
                                        <th>
                                            <input
                                                type="checkbox"
                                                className="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedIds.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                                            />
                                        </th>
                                    )}
                                    <th>From</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Payment Code</th>
                                    <th>Grade</th>
                                    <th>Exam Section</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan={hasRole(['Admin', 'SuperAdmin']) ? "10" : "9"} className="text-center py-8">
                                            No registrations found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRegistrations.map((reg) => (
                                        <tr key={reg.id}>
                                            {hasRole(['Admin', 'SuperAdmin']) && (
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox"
                                                        checked={selectedIds.includes(reg.id)}
                                                        onChange={() => handleSelectOne(reg.id)}
                                                    />
                                                </td>
                                            )}
                                            <td>AP Exam</td>
                                            <td className="font-medium">
                                                {reg.firstName} {reg.lastName}
                                            </td>
                                            <td>{reg.email}</td>
                                            <td>{reg.paymentCode}</td>
                                            <td>{reg.grade}</td>
                                            <td>{reg.examSections.length}</td>
                                            <td>
                                                <span className={`badge ${
                                                    reg.paymentStatus === 'Confirmed' ? 'badge-success' :
                                                        reg.paymentStatus === 'Pending' ? 'badge-warning' :
                                                            'badge-error'
                                                }`}>
                                                    {reg.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="text-sm">{formatDate(reg.createdAt)}</td>
                                            <td>
                                                <div className="flex gap-2 items-center justify-center">
                                                    <Link
                                                        to={`/admin/registrations/${reg.id}`}
                                                        className="btn btn-info btn-sm"
                                                    >
                                                        View
                                                    </Link>
                                                    {hasRole(['Admin', 'SuperAdmin']) && (
                                                        <button
                                                            onClick={() => handleDelete(reg)}
                                                            className="btn btn-error btn-sm"
                                                        >
                                                            Delete
                                                        </button>
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
            </div>
        </Layout>
    );
};