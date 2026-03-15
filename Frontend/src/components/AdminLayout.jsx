import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const menuItems = [
    { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/projects', icon: 'bi-briefcase', label: 'Service Requests' },
    { path: '/staff-management', icon: 'bi-people', label: 'Staff Management' },
    { path: '/government', icon: 'bi-bank', label: 'Government Projects' },
    { path: '/revenue-analytics', icon: 'bi-graph-up', label: 'Revenue Analytics' }
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <nav className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">
            {!sidebarCollapsed && 'Aquafix Admin'}
          </h3>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className={`bi ${sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
          </button>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar-menu-item">
              <Link
                to={item.path}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`}></i>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <button className="btn btn-logout" onClick={logout}>
            <i className="bi bi-box-arrow-right"></i>
            {!sidebarCollapsed && <span className="ms-2">Logout</span>}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <div className="content-wrapper">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;