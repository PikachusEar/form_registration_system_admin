# Amberson Registration Admin Panel

A modern, responsive admin dashboard for managing student registrations for AP exams. Built with React, Vite, and DaisyUI.

## 📋 Features

### Authentication & Authorization
- Secure login system with JWT tokens
- Role-based access control (SuperAdmin, Admin, Viewer)
- Protected routes and conditional UI rendering
- Session management with automatic logout on token expiration

### Dashboard
- Real-time statistics overview
- Total, pending, confirmed, and cancelled registrations
- Recent registrations feed
- Quick navigation to key sections

### Registration Management
- View all registrations in a sortable table
- Advanced filtering (by status, search by name/email/school)
- Individual registration detail view
- Status updates with audit trail
- Bulk status updates for multiple registrations
- Export registrations to CSV
- Send email notifications to students

### User Management (SuperAdmin only)
- Create, edit, and delete admin users
- Manage user roles and permissions
- Update user passwords
- Activate/deactivate user accounts
- View user login history

### Additional Features
- Responsive design for mobile and desktop
- Loading states and error handling
- Audit history tracking
- Custom notification messages

## 🛠️ Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite 7
- **Routing:** React Router DOM 7
- **Styling:** Tailwind CSS 4 + DaisyUI 5
- **State Management:** React Context API
- **HTTP Client:** Fetch API
- **Authentication:** JWT tokens

## 📦 Installation

### Prerequisites
- Node.js (v20.19.0 or >=22.12.0)
- npm (v8.0.0 or higher)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd form_registration_system_admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5051/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/
│   │   └── ProtectRoute.jsx      # Route protection wrapper
│   ├── layout/
│   │   └── Layout.jsx             # Main layout with navbar & sidebar
│   └── page/
│       ├── DashboardPage.jsx      # Dashboard overview
│       ├── LoginPage.jsx          # Login page
│       ├── RegistrationsPage.jsx  # Registration list
│       ├── RegistrationDetailPage.jsx  # Single registration view
│       └── UserManagementPage.jsx # User management (SuperAdmin)
├── context/
│   └── AuthContext.jsx            # Authentication context & hooks
├── service/
│   └── api.js                     # API service layer
├── App.jsx                        # Main app component with routing
├── App.css                        # Global styles
└── main.jsx                       # Application entry point
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 User Roles & Permissions

| Feature | Viewer | Admin | SuperAdmin |
|---------|--------|-------|------------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Registrations | ✅ | ✅ | ✅ |
| Update Registration Status | ❌ | ✅ | ✅ |
| Bulk Update Status | ❌ | ✅ | ✅ |
| Send Notifications | ❌ | ✅ | ✅ |
| Export CSV | ✅ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ |

## 🔌 API Integration

The application expects the following API endpoints:

### Authentication
- `POST /api/admin/login` - Login
- `GET /api/admin/me` - Get current user

### Registrations
- `GET /api/registrations` - Get all registrations
- `GET /api/registrations/:id` - Get registration by ID
- `PUT /api/registrations/:id` - Update registration info
- `PUT /api/registrations/:id/status` - Update registration status
- `PUT /api/registrations/bulk-status` - Bulk update statuses
- `POST /api/registrations/:id/notify` - Send notification email
- `GET /api/registrations/export` - Export to CSV

### Admin Users (SuperAdmin only)
- `GET /api/Admin/getAllusers` - Get all admin users
- `GET /api/admin/users/:id` - Get user by ID
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `PUT /api/admin/users/:id/password` - Update user password
- `DELETE /api/admin/users/:id` - Delete user

## 🎨 Styling

The application uses:
- **Tailwind CSS 4** for utility-first styling
- **DaisyUI 5** for pre-built UI components
- Responsive design with mobile-first approach
- Dark mode support through DaisyUI themes

## 🔒 Security Features

- JWT token-based authentication
- Automatic token refresh handling
- Protected routes with role validation
- XSS protection through React's built-in sanitization
- Secure password handling (minimum 8 characters)

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5051/api` |

## 🧪 Default Credentials

*Note: These should be configured in your backend*

Example roles:
- SuperAdmin: Full access
- Admin: Registration management
- Viewer: Read-only access

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)


## 📝 Development Guidelines

- Follow React best practices and hooks conventions
- Use functional components with hooks
- Maintain consistent code formatting
- Add proper error handling
- Test thoroughly before submitting PRs

## 🐛 Troubleshooting

### Common Issues

**Issue:** Build fails with module errors
```bash
rm -rf node_modules package-lock.json
npm install
```

**Issue:** API connection errors
- Verify `VITE_API_URL` is correctly set
- Ensure backend server is running
- Check CORS configuration on backend

**Issue:** Login fails
- Verify API endpoint is accessible
- Check network tab for response details
- Ensure backend authentication is configured

## 📄 License

This project is private and proprietary.

## 👥 Support

For issues and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for Amberson AP Exam Registration System**