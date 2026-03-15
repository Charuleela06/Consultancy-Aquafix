import { Link, NavLink, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toLowerCase();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm px-4 mb-4 sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to={role === "admin" ? "/dashboard" : "/"}>
          <i className="bi bi-shield-check fs-4"></i>
          <span>Aquafix</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {token ? (
              <>
                <li className="nav-item me-2 d-none d-lg-block">
                  <span className="badge rounded-pill text-bg-light text-primary fw-semibold px-3 py-2" style={{ opacity: 0.95 }}>
                    {role || "user"}
                  </span>
                </li>
                {role === "admin" ? (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link mx-1" to="/dashboard" style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}>Dashboard</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link mx-1" to="/staff-management" style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}>Staff</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link mx-1" to="/projects" style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}>Requests</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link mx-1" to="/revenue-analytics" style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}>Revenue</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link mx-1" to="/government" style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}>Government</NavLink>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link mx-1" to="/" style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}>Home</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link mx-1" to="/request" style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}>FixFlow</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link mx-1" to="/my-requests" style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}>FixTrack</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link mx-1" to="/transactions" style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}>Billing Center</NavLink>
                    </li>
                  </>
                )}
                <li className="nav-item ms-lg-3">
                  <button className="btn btn-light btn-sm fw-bold px-3 py-2 rounded-pill shadow-sm" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link mx-1" to="/" style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}>Home</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link mx-1" to="/login" style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}>Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link mx-1" to="/register" style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}>Register</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
