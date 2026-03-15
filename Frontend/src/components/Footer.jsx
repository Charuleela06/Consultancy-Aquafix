import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const role = localStorage.getItem("role");

  return (
    <footer className="bg-white py-5 mt-5 border-top">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6 mb-4 footer-brand">
            <h5 className="fw-bold text-primary mb-3 d-flex align-items-center">
              <i className="bi bi-droplet-fill me-2"></i>
              Aquafix
            </h5>
            <p className="text-muted pe-md-5">
              Providing top-tier electrical and plumbing contracting services with a focus on quality, efficiency, and customer satisfaction since 2010.
            </p>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-bold mb-4">Quick Links</h6>
            <ul className="list-unstyled">
              {role === "admin" ? (
                <>
                  <li className="mb-2"><Link to="/dashboard" className="text-decoration-none text-muted footer-link">Dashboard</Link></li>
                  <li className="mb-2"><Link to="/projects" className="text-decoration-none text-muted footer-link">Projects</Link></li>
                  <li className="mb-2"><Link to="/government" className="text-decoration-none text-muted footer-link">Govt Projects</Link></li>
                </>
              ) : (
                <>
                  <li className="mb-2"><Link to="/" className="text-decoration-none text-muted footer-link">Home</Link></li>
                  <li className="mb-2"><Link to="/request" className="text-decoration-none text-muted footer-link">Service Request</Link></li>
                </>
              )}
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="fw-bold mb-4">Services</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><span className="text-muted small"><i className="bi bi-check2-circle me-2 text-primary"></i>Electrical Installation</span></li>
              <li className="mb-2"><span className="text-muted small"><i className="bi bi-check2-circle me-2 text-primary"></i>Plumbing Maintenance</span></li>
              <li className="mb-2"><span className="text-muted small"><i className="bi bi-check2-circle me-2 text-primary"></i>Project Management</span></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="fw-bold mb-4 text-lg-end">Contact Us</h6>
            <div className="text-lg-end">
              <p className="text-muted small mb-2">
                <i className="bi bi-envelope me-2 text-primary"></i>
                support@aquafix.com
              </p>
              <p className="text-muted small mb-3">
                <i className="bi bi-telephone me-2 text-primary"></i>
                +1 (555) 123-4567
              </p>
              <div className="d-flex justify-content-lg-end gap-3 mt-4">
                <a href="#" className="text-muted social-icon"><i className="bi bi-facebook"></i></a>
                <a href="#" className="text-muted social-icon"><i className="bi bi-twitter-x"></i></a>
                <a href="#" className="text-muted social-icon"><i className="bi bi-linkedin"></i></a>
                <a href="#" className="text-muted social-icon"><i className="bi bi-instagram"></i></a>
              </div>
            </div>
          </div>
        </div>
        <hr className="my-5" />
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="text-muted small mb-0">
              © {new Date().getFullYear()} Aquafix Inc. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
            <ul className="list-inline mb-0">
              <li className="list-inline-item me-4">
                <a href="#" className="text-decoration-none text-muted small footer-link">Privacy Policy</a>
              </li>
              <li className="list-inline-item">
                <a href="#" className="text-decoration-none text-muted small footer-link">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
