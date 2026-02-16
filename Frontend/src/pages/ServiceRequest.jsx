import { useEffect, useState } from "react";
import API from "../api/api";
import { generateServiceBillPDF } from "../utils/pdfGenerator";
import "../styles/ServiceRequest.css";

export default function ServiceRequest() {
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", serviceType: "", message: "" });
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) {
        fetchRequests();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests", err);
      setError(err.response?.data?.message || "Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    fetchRequests();
  };

  const downloadLatestApprovedBill = async (requestId) => {
    try {
      const res = await API.get(`/request-billing/request/${requestId}`);
      const list = res.data || [];
      const approved = list.filter((b) => b.status === "Approved");
      const latest = approved.length > 0 ? approved[approved.length - 1] : null;
      if (!latest) {
        alert("No approved bill found for this request");
        return;
      }
      generateServiceBillPDF(latest);
    } catch (err) {
      alert("Failed to download bill");
    }
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.phoneNumber || !form.serviceType) return alert("Please fill all required fields");
    try {
      await API.post("/requests", form);
      alert("Request submitted successfully!");
      setForm({ name: "", email: "", phoneNumber: "", serviceType: "", message: "" });
      setError(null);
      fetchRequests();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Submission failed";
      alert("Submission failed: " + errorMsg);
      console.error("Error submitting request", err);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
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
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Service</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Assigned Staff</th>
                    <th>Bill Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r._id}>
                      <td className="text-capitalize fw-bold">{r.serviceType}</td>
                      <td>{r.phoneNumber}</td>
                      <td><span className={`badge ${r.status === 'Pending' ? 'bg-warning' : r.status === 'Completed' ? 'bg-success' : 'bg-primary'}`}>{r.status}</span></td>
                      <td>{r.assignedStaff ? r.assignedStaff.name : 'Not Assigned'}</td>
                      <td>
                        {r.billAmount > 0 ? (
                          <span className="fw-bold text-success">₹{r.billAmount.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted small">Pending Approval</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(r)}
                          >
                            View Details
                          </button>
                          {r.billAmount > 0 && (
                            <button 
                              className="btn btn-sm btn-outline-dark"
                              onClick={() => downloadLatestApprovedBill(r._id)}
                              title="Download Bill"
                            >
                              <i className="bi bi-download"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">No requests found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Request Details</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="text-muted small d-block">Request Name</label>
                  <span className="fw-bold fs-5 text-capitalize">{selectedRequest.serviceType} Request</span>
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="text-muted small d-block">Client Name</label>
                    <span className="fw-bold">{selectedRequest.name}</span>
                  </div>
                  <div className="col-6">
                    <label className="text-muted small d-block">Date Submitted</label>
                    <span className="fw-bold">{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-muted small d-block">Message/Requirements</label>
                  <p className="bg-light p-3 rounded mb-0">{selectedRequest.message || 'No specific requirements mentioned.'}</p>
                </div>
                <hr />
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="text-muted small d-block">Assigned Staff</label>
                    <span className={`fw-bold ${selectedRequest.assignedStaff ? 'text-dark' : 'text-danger'}`}>
                      {selectedRequest.assignedStaff ? selectedRequest.assignedStaff.name : 'Not Assigned'}
                    </span>
                  </div>
                  <div className="col-6">
                    <label className="text-muted small d-block">Staff Contact</label>
                    <span className="fw-bold">{selectedRequest.assignedStaff?.phoneNumber || 'N/A'}</span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <label className="text-muted small d-block">Bill Amount</label>
                    <span className="fw-bold text-success fs-5">
                      {selectedRequest.billAmount > 0 ? `₹${selectedRequest.billAmount.toLocaleString()}` : 'Awaiting Quote'}
                    </span>
                  </div>
                  <div className="col-6">
                    <label className="text-muted small d-block">Payment Status</label>
                    <span className={`badge ${selectedRequest.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                      {selectedRequest.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary px-4" onClick={closeModal}>Close</button>
                {selectedRequest.billAmount > 0 && (
                  <button type="button" className="btn btn-primary px-4" onClick={() => downloadLatestApprovedBill(selectedRequest._id)}>
                    Download Bill
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
