import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleRequest = () => {
    if (token) navigate('/request');
    else navigate('/login');
  };

  const handleGetStarted = () => {
    if (token) navigate('/request');
    else navigate('/login');
  };

  const handleViewAllRequests = () => {
    if (token) navigate('/my-requests');
    else navigate('/login');
  };

  return (
    <div className="home-container">
      <header className="hero-section text-center text-white d-flex align-items-center justify-content-center">
        <div className="app-blob blue" style={{ top: "-240px", left: "-180px" }}></div>
        <div className="app-blob pink" style={{ top: "-220px", right: "-220px", animationDelay: "-2.2s" }}></div>
        <div className="container">
          <h1 className="display-3 fw-bold mb-4 app-slide-up">Expert Services</h1>
          <p className="lead mb-5 app-slide-up" style={{ animationDelay: "80ms" }}>Transforming your business with innovative solutions and strategic insights.</p>
          <button type="button" onClick={handleRequest} className="btn btn-navbar btn-lg px-5 py-3 rounded-pill shadow app-pop" style={{ animationDelay: "140ms" }}>
            Request a Service
          </button>
        </div>
      </header>

      <section className="services-overview py-5">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">Our Services</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 app-hover-lift app-fade-in">
                <div className="card-body text-center">
                  <i className="bi bi-briefcase fs-1 text-primary mb-3"></i>
                  <h5 className="card-title fw-bold">Business Strategy</h5>
                  <p className="card-text text-muted">Comprehensive planning to help your business reach its full potential.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 app-hover-lift app-fade-in" style={{ animationDelay: "70ms" }}>
                <div className="card-body text-center">
                  <i className="bi bi-graph-up-arrow fs-1 text-success mb-3"></i>
                  <h5 className="card-title fw-bold">Market Analysis</h5>
                  <p className="card-text text-muted">In-depth research and data-driven insights into your target market.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 app-hover-lift app-fade-in" style={{ animationDelay: "140ms" }}>
                <div className="card-body text-center">
                  <i className="bi bi-gear fs-1 text-warning mb-3"></i>
                  <h5 className="card-title fw-bold">Operations Optimization</h5>
                  <p className="card-text text-muted">Streamlining your processes for maximum efficiency and productivity.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-5 d-flex justify-content-center flex-wrap gap-3">
            <button type="button" onClick={handleViewAllRequests} className="btn btn-navbar-outline btn-lg px-5 py-3 rounded-pill shadow-sm app-pop">
              View All Requests
            </button>
          </div>
        </div>
      </section>

      <section className="about-section py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="fw-bold mb-4">Why Choose Us?</h2>
              <p className="text-muted mb-4">With years of experience across various industries, our team of experts is dedicated to delivering results that exceed expectations. We pride ourselves on our client-centric approach and commitment to excellence.</p>
              <ul className="list-unstyled">
                <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i> Tailored solutions for your unique needs</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i> Experienced professionals with industry expertise</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i> Proven track record of success</li>
              </ul>
            </div>
            <div className="col-lg-6 mt-4 mt-lg-0">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800" alt="Consultancy Team" className="img-fluid rounded shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      <footer className="cta-section py-5 text-center bg-primary text-white">
        <div className="container">
          <h2 className="mb-4">Ready to take your business to the next level?</h2>
          <p className="lead mb-4">Contact us today to discuss how we can help you achieve your goals.</p>
          <button type="button" onClick={handleGetStarted} className="btn btn-navbar btn-lg px-5 py-3 rounded-pill shadow">Get Started</button>
        </div>
      </footer>
    </div>
  );
};

export default Home;
