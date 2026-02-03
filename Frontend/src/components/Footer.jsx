import { Link } from "react-router-dom";

export default function Footer() {
  const role = localStorage.getItem("role");

  return (
    <footer className="bg-white py-5 mt-5 border-top">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold text-primary mb-3">Consultancy</h5>
            <p className="text-muted">Providing top-tier electrical and plumbing contracting services with a focus on quality and efficiency.</p>
          </div>
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              {role === "admin" ? (
                <>
                  <li><Link to="/dashboard" className="text-decoration-none text-muted">Dashboard</Link></li>
                  <li><Link to="/projects" className="text-decoration-none text-muted">Projects</Link></li>
                  <li><Link to="/government" className="text-decoration-none text-muted">Govt Projects</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/home" className="text-decoration-none text-muted">Home</Link></li>
                  <li><Link to="/request" className="text-decoration-none text-muted">Service Request</Link></li>
                </>
              )}
            </ul>
          </div>
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3">Services</h6>
            <ul className="list-unstyled">
              <li className="text-muted small mb-1">Electrical Installation</li>
              <li className="text-muted small mb-1">Plumbing Maintenance</li>
              <li className="text-muted small mb-1">Project Management</li>
            </ul>
          </div>
          <div className="col-md-3 mb-4 text-md-end">
            <h6 className="fw-bold mb-3">Contact Us</h6>
            <p className="text-muted small mb-1">support@consultancy.com</p>
            <p className="text-muted small mb-1">+1 (555) 123-4567</p>
            <div className="d-flex justify-content-md-end gap-3 mt-3 text-primary">
              <i className="bi bi-facebook fs-5"></i>
              <i className="bi bi-twitter-x fs-5"></i>
              <i className="bi bi-linkedin fs-5"></i>
            </div>
          </div>
        </div>
        <hr className="my-4 text-muted opacity-25" />
        <div className="text-center text-muted small">
          © {new Date().getFullYear()} Consultancy Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
