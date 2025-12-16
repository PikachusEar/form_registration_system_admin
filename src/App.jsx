import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectRoute';
import { LoginPage } from './components/page/LoginPage';
import { DashboardPage } from './components/page/DashboardPage';
import { RegistrationsPage } from './components/page/RegistrationsPage';
import { RegistrationDetailPage } from './components/page/RegistrationDetailPage';
import { UserManagementPage } from './components/page/UserManagementPage';
import { ExamSectionNamesPage } from './components/page/ExamSectionNamesPage.jsx';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/admin">
                        {/* Public Route */}
                        <Route path="login" element={<LoginPage/>}/>

                        {/* Protected Routes */}
                        <Route
                            index
                            element={
                                <ProtectedRoute>
                                    <DashboardPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="registrations"
                            element={
                                <ProtectedRoute>
                                    <RegistrationsPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="registrations/:id"
                            element={
                                <ProtectedRoute>
                                    <RegistrationDetailPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="exam-sections"
                            element={
                                <ProtectedRoute>
                                    <ExamSectionNamesPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="users"
                            element={
                                <ProtectedRoute roles="SuperAdmin">
                                    <UserManagementPage/>
                                </ProtectedRoute>
                            }
                        />

                        {/* Catch all - redirect to dashboard */}
                        <Route path="*" element={<Navigate to="/admin" replace/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;