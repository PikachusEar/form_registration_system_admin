import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registrationAPI } from '../../service/api';
import { Layout } from '../layout/Layout.jsx';
import { useAuth } from '../../context/AuthContext';

export const RegistrationDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [sending, setSending] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [notes, setNotes] = useState('');
    const [customMessage, setCustomMessage] = useState('');

    useEffect(() => {
        fetchRegistration();
    }, [id]);

    const fetchRegistration = async () => {
        try {
            const response = await registrationAPI.getById(id);
            setRegistration(response.data);
            setNewStatus(response.data.paymentStatus);
        } catch (error) {
            console.error('Error fetching registration:', error);
            alert('Registration not found');
            navigate('/registrations');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (newStatus === registration.paymentStatus) {
            alert('No changes to save');
            return;
        }

        if (!confirm(`Change status to ${newStatus}?`)) return;

        setUpdating(true);
        try {
            const currentUser = JSON.parse(localStorage.getItem('adminUser'));
            await registrationAPI.updateStatus(id, {
                paymentStatus: newStatus,
                notes: notes || `Status changed to ${newStatus}`,
                updatedBy: currentUser?.username || 'Admin',
            });

            alert('Status updated successfully!');
            setNotes('');
            await fetchRegistration();
        } catch (error) {
            alert('Error updating status: ' + (error.message || 'Unknown error'));
        } finally {
            setUpdating(false);
        }
    };

    const handleSendNotification = async () => {
        if (!confirm('Send notification email to student?')) return;

        setSending(true);
        try {
            await registrationAPI.sendNotification(id, customMessage || null);
            alert('Notification sent successfully!');
            setCustomMessage('');
            await fetchRegistration();
        } catch (error) {
            alert('Error sending notification: ' + (error.message || 'Unknown error'));
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
                        <button
                            onClick={() => navigate('/registrations')}
                            className="btn btn-ghost btn-sm mb-2"
                        >
                            ← Back to Registrations
                        </button>
                        <h1 className="text-3xl font-bold">
                            {registration.firstName} {registration.lastName}
                        </h1>
                        <p className="text-base-content/60 mt-2">
                            Registration Details
                        </p>
                    </div>
                    <span className={`badge badge-lg ${
                        registration.paymentStatus === 'Confirmed' ? 'badge-success' :
                            registration.paymentStatus === 'Pending' ? 'badge-warning' :
                                'badge-error'
                    }`}>
            {registration.paymentStatus}
          </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Registration Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">Student Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">First Name</span>
                                        </label>
                                        <div>
                                            <input type="text" value={registration.firstName} className="input"/>
                                        </div>

                                    </div>
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">Last Name</span>
                                        </label>
                                        <div>
                                            <input type="text" value={registration.lastName} className="input"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">Email</span>
                                        </label>
                                        <div>
                                            <input type="text" value={registration.email} className="input"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">Mobile Phone</span>
                                        </label>
                                        <div>
                                            <input type="text" value={registration.mobilePhone} className="input"/>
                                        </div>
                                    </div>
                                    {registration.homePhone && (
                                        <div>
                                            <label className="label">
                                                <span className="label-text font-semibold">Home Phone</span>
                                            </label>
                                            <div>
                                                <input type="text" value={registration.homePhone} className="input"/>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">School</span>
                                        </label>
                                        <div>
                                            <input type="text" value={registration.currentSchool} className="input"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">Grade</span>
                                        </label>
                                        <div>
                                            <input type="text" value={registration.grade} className="input"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">Exam Section</span>
                                        </label>
                                        <div>
                                            <input type="text" value={registration.examSection} className="input"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">Created At</span>
                                        </label>
                                        <p>{formatDate(registration.createdAt)}</p>
                                    </div>
                                    {registration.updatedAt && (
                                        <div>
                                            <label className="label">
                                                <span className="label-text font-semibold">Last Updated</span>
                                            </label>
                                            <p>{formatDate(registration.updatedAt)}</p>
                                            {registration.updatedBy && (
                                                <p className="text-sm text-base-content/60">by {registration.updatedBy}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Audit History */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">Edit History</h2>
                                {registration.auditHistory && registration.auditHistory.length > 0 ? (
                                    <div className="space-y-3">
                                        {registration.auditHistory.map((audit) => (
                                            <div key={audit.id} className="border-l-4 border-primary pl-4 py-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold">{audit.action}</p>
                                                        <p className="text-sm text-base-content/60">
                                                            by {audit.changedBy}
                                                        </p>
                                                        {audit.notes && (
                                                            <p className="text-sm mt-1">{audit.notes}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-base-content/60">
                            {formatDate(audit.changedAt)}
                          </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-base-content/60">No edit history available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="space-y-6">
                        {/* Update Status */}
                        {hasRole(['Admin', 'SuperAdmin']) && (
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title">Update Status</h2>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">New Status</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full"
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            disabled={updating}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Notes (optional)</span>
                                        </label>
                                        <textarea
                                            className="textarea textarea-bordered"
                                            placeholder="Add notes about this status change..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            disabled={updating}
                                            rows="2"
                                        />
                                    </div>
                                    <button
                                        onClick={handleUpdateStatus}
                                        className="btn btn-primary w-full"
                                        disabled={updating || newStatus === registration.paymentStatus}
                                    >
                                        {updating ? 'Updating...' : 'Update Status'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Send Notification */}
                        {hasRole(['Admin', 'SuperAdmin']) && (
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title">Send Notification</h2>
                                    <p className="text-sm text-base-content/60">
                                        Send email notification to student about current registration status
                                    </p>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Custom Message (optional)</span>
                                        </label>
                                        <textarea
                                            className="textarea textarea-bordered"
                                            placeholder="Add a custom message to include in the email..."
                                            value={customMessage}
                                            onChange={(e) => setCustomMessage(e.target.value)}
                                            disabled={sending}
                                            rows="3"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendNotification}
                                        className="btn btn-secondary w-full"
                                        disabled={sending}
                                    >
                                        {sending ? (
                                            <>
                                                <span className="loading loading-spinner"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Send Notification
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};