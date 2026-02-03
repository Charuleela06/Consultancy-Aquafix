import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/ServiceRequest.css";

export default function ServiceRequest() {
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", serviceType: "", message: "" });
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/requests");
      setRequests(res.data);
    } catch (err) {
      console.log("Error fetching requests", err);
    }
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.phoneNumber || !form.serviceType) return alert("Please fill required fields");
    try {
      await API.post("/requests", form);
      alert("Request submitted successfully!");
      setForm({ name: "", email: "", phoneNumber: "", serviceType: "", message: "" });
      fetchRequests();
    } catch (err) {
      alert("Submission failed");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-lg p-5 mb-5 border-0">
            <h2 className="text-center mb-4 fw-bold">Service Request Form</h2>
            <p className="text-center text-muted mb-5">Fill out the form below and we'll get back to you as soon as possible.</p>
            
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">Full Name</label>
                <input 
                  className="form-control" 
                  placeholder="John Doe" 
                  value={form.name}
                  onChange={e => setForm({...form, name:e.target.value})}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Email Address</label>
                <input 
                  type="email"
                  className="form-control" 
                  placeholder="john@example.com" 
                  value={form.email}
                  onChange={e => setForm({...form, email:e.target.value})}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Phone Number</label>
                <input 
                  className="form-control" 
                  placeholder="+1 (555) 000-0000" 
                  value={form.phoneNumber}
                  onChange={e => setForm({...form, phoneNumber:e.target.value})}
                />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold">Service Type</label>
                <select 
                  className="form-select"
                  value={form.serviceType}
                  onChange={e => setForm({...form, serviceType:e.target.value})}
                >
                  <option value="">Select a service...</option>
                  <option value="electrical">Electrical Work</option>
                  <option value="plumbing">Plumbing Work</option>
                  <option value="maintenance">General Maintenance</option>
                  <option value="consultation">Project Consultation</option>
                </select>
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold">Detailed Message</label>
                <textarea 
                  className="form-control" 
                  rows="4"
                  placeholder="Tell us more about your requirements..." 
                  value={form.message}
                  onChange={e => setForm({...form, message:e.target.value})}
                />
              </div>
              <div className="col-md-12 text-center mt-4">
                <button className="btn btn-primary btn-lg px-5 shadow" onClick={submit}>Submit Request</button>
              </div>
            </div>
          </div>

          <div className="card shadow-sm p-4 border-0">
            <h3 className="mb-4 fw-bold">Your Requests</h3>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Service</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Assigned Staff</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r._id}>
                      <td className="text-capitalize fw-bold">{r.serviceType}</td>
                      <td>{r.phoneNumber}</td>
                      <td><span className={`badge ${r.status === 'Pending' ? 'bg-warning' : r.status === 'Completed' ? 'bg-success' : 'bg-primary'}`}>{r.status}</span></td>
                      <td>{r.assignedStaff ? r.assignedStaff.name : 'Not Assigned'}</td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">No requests found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
