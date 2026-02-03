import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [statsData, setStatsData] = useState({
    totalProjects: 0,
    pendingRequests: 0,
    govtProjects: 0,
    activeTasks: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    API.get("/stats")
      .then(res => setStatsData(res.data))
      .catch(err => console.log(err));

    API.get("/requests")
      .then(res => setRecentRequests(res.data.slice(0, 3)))
      .catch(err => console.log(err));
  }, []);

  const stats = [
    { title: "Total Projects", value: statsData.totalProjects, icon: "bi-briefcase", color: "primary" },
    { title: "Pending Requests", value: statsData.pendingRequests, icon: "bi-clock", color: "warning" },
    { title: "Govt Projects", value: statsData.govtProjects, icon: "bi-bank", color: "success" },
    { title: "Active Tasks", value: statsData.activeTasks, icon: "bi-list-check", color: "info" }
  ];

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-5 fw-bold">Contractor Dashboard</h1>
          <p className="text-muted fs-5">Welcome back! Here's a quick overview of your business.</p>
        </div>
      </div>

      <div className="row mb-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-md-3 mb-3">
            <div className={`card bg-${stat.color} text-white h-100 border-0 shadow`}>
              <div className="card-body d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="card-title text-uppercase mb-0 opacity-75 fw-bold">{stat.title}</h6>
                  <i className={`bi ${stat.icon} fs-3`}></i>
                </div>
                <h2 className="display-6 fw-bold mb-0">{stat.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card p-4 mb-4 border-0 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">Recent Activity</h3>
              <button className="btn btn-sm btn-link text-decoration-none" onClick={() => window.location.href='/projects'}>View All</button>
            </div>
            <ul className="list-group list-group-flush">
              {recentRequests.map(req => (
                <li key={req._id} className="list-group-item px-0 py-3 d-flex align-items-center border-0 border-bottom">
                  <div className="bg-primary-subtle text-primary rounded-circle p-2 me-3">
                    <i className="bi bi-person-plus"></i>
                  </div>
                  <div>
                    <div className="fw-bold">{req.name} requested {req.serviceType}</div>
                    <small className="text-muted">{new Date(req.createdAt).toLocaleDateString()} • {req.status}</small>
                  </div>
                </li>
              ))}
              {recentRequests.length === 0 && (
                <li className="list-group-item px-0 py-3 text-muted">No recent activity</li>
              )}
            </ul>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card p-4 bg-dark text-white mb-4 border-0 shadow-sm">
            <h4 className="mb-3">Quick Actions</h4>
            <div className="d-grid gap-3 mt-2">
              <button className="btn btn-primary d-flex align-items-center justify-content-center gap-2" onClick={() => window.location.href='/projects'}>
                <i className="bi bi-eye"></i> View All Requests
              </button>
              <button className="btn btn-outline-light d-flex align-items-center justify-content-center gap-2" onClick={() => window.location.href='/government'}>
                <i className="bi bi-bank"></i> Govt Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
