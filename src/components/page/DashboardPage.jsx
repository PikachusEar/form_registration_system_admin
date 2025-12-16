import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationAPI } from '../../service/api';
import { Layout } from '../layout/Layout.jsx';

export const DashboardPage = () => {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
    });
    const [recentRegistrations, setRecentRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await registrationAPI.getAll();
            const registrations = response.data || [];

            // Calculate statistics
            const statistics = {
                total: registrations.length,
                pending: registrations.filter(r => r.paymentStatus === 'Pending').length,
                confirmed: registrations.filter(r => r.paymentStatus === 'Confirmed').length,
                cancelled: registrations.filter(r => r.paymentStatus === 'Cancelled').length,
            };

            setStats(statistics);

            // Get 5 most recent registrations
            const sorted = [...registrations].sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            ).slice(0, 5);

            setRecentRegistrations(sorted);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
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
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-base-content/60 mt-2">Overview of Registrations</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="stats shadow">
                        <div className="stat">
                            <div className="stat-figure text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <div className="stat-title">Total Registrations</div>
                            <div className="stat-value text-primary">{stats.total}</div>
                        </div>
                    </div>

                    <div className="stats shadow">
                        <div className="stat">
                            <div className="stat-figure text-warning">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div className="stat-title">Pending</div>
                            <div className="stat-value text-warning">{stats.pending}</div>
                        </div>
                    </div>

                    <div className="stats shadow">
                        <div className="stat">
                            <div className="stat-figure text-success">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div className="stat-title">Confirmed</div>
                            <div className="stat-value text-success">{stats.confirmed}</div>
                        </div>
                    </div>

                    <div className="stats shadow">
                        <div className="stat">
                            <div className="stat-figure text-error">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div className="stat-title">Cancelled</div>
                            <div className="stat-value text-error">{stats.cancelled}</div>
                        </div>
                    </div>
                </div>

                {/* Recent Registrations */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="card-title">Recent Registrations</h2>
                            <Link to="/admin/registrations" className="btn btn-sm btn-primary">
                                View All
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>School</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                {recentRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">No registrations yet</td>
                                    </tr>
                                ) : (
                                    recentRegistrations.map((reg) => (
                                        <tr key={reg.id}>
                                            <td className="font-medium">
                                                {reg.firstName} {reg.lastName}
                                            </td>
                                            <td>{reg.email}</td>
                                            <td>{reg.currentSchool}</td>
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