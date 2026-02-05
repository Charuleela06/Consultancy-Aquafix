import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/Projects.css";

export default function Projects() {
  const [requests, setRequests] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchStaff();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/requests");
      setRequests(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await API.get("/auth/staff/available");
      setStaffList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateStatus = async (requestId, status) => {
    try {
      await API.put("/requests/status", { requestId, status });
      alert("Status updated successfully");
      fetchRequests();
      setShowModal(false);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const updateBillAmount = async (requestId, billAmount) => {
    try {
      await API.put("/requests/bill", { requestId, billAmount });
      alert("Bill amount updated successfully");
      fetchRequests();
      setShowModal(false);
    } catch (err) {
      alert("Failed to update bill amount");
    }
  };

  const assignStaff = async (requestId, staffId) => {
    try {
      await API.put("/requests/assign", { requestId, staffId });
      alert("Staff assigned successfully");
      fetchRequests();
      if (selectedRequest && selectedRequest._id === requestId) {
        const updated = requests.find(r => r._id === requestId);
        // We need to wait for the next fetch or manually update local state
        // Simplest is to just re-fetch and close modal or update modal data
        setShowModal(false);
      }
    } catch (err) {
      alert("Failed to assign staff");
    }
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="fw-bold text-primary">Service Requests</h1>
          <p className="text-muted">Review and manage all incoming service requests from users.</p>
        </div>
      </div>

      <div className="row">
        {requests.length > 0 ? (
          requests.map(r => (
            <div key={r._id} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm border-0 border-top border-4 border-primary">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title fw-bold mb-0">{r.serviceType}</h5>
                    <span className={`badge ${r.status === 'Pending' ? 'bg-warning' : r.status === 'Completed' ? 'bg-success' : 'bg-primary'}`}>{r.status}</span>
                  </div>
                  <h6 className="card-subtitle mb-2 text-muted">From: {r.name}</h6>
                  <p className="card-text text-truncate">{r.message}</p>
                  <div className="mt-3">
                    <strong>Staff Assigned: </strong>
                    {r.assignedStaff ? (
                      <span className="text-success fw-bold">{r.assignedStaff.name}</span>
                    ) : (
                      <span className="text-danger fw-bold">Not Assigned</span>
                    )}
                  </div>
                </div>
                <div className="card-footer bg-transparent border-0 d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => viewDetails(r)}>View Details</button>
                  {!r.assignedStaff && (
                    <button className="btn btn-sm btn-primary flex-grow-1" onClick={() => viewDetails(r)}>Set Staff</button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col text-center py-5">
            <div className="display-1 text-muted mb-4"><i className="bi bi-inbox"></i></div>
            <p className="text-muted fs-5">No service requests found.</p>
          </div>
        )}
      </div>

      {/* Bootstrap Modal for Details */}
      {showModal && selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">Request Details - {selectedRequest.serviceType}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small text-uppercase fw-bold">Customer Name</p>
                    <p className="fs-5">{selectedRequest.name}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small text-uppercase fw-bold">Email Address</p>
                    <p className="fs-5">{selectedRequest.email}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small text-uppercase fw-bold">Phone Number</p>
                    <p className="fs-5">{selectedRequest.phoneNumber}</p>
                  </div>
                  <div className="col-12">
                    <p className="mb-1 text-muted small text-uppercase fw-bold">Message / Requirements</p>
                    <p className="p-3 bg-light rounded">{selectedRequest.message}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small text-uppercase fw-bold">Status</p>
                    <select 
                      className="form-select"
                      value={selectedRequest.status}
                      onChange={(e) => updateStatus(selectedRequest._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small text-uppercase fw-bold">Assigned Staff</p>
                    {selectedRequest.assignedStaff ? (
                      <div className="d-flex flex-column gap-1">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-person-check-fill text-success fs-4"></i>
                          <span className="fs-5 fw-bold">{selectedRequest.assignedStaff.name}</span>
                        </div>
                        <div className="text-muted small">
                          <i className="bi bi-telephone-fill me-2"></i>
                          {selectedRequest.assignedStaff.phoneNumber || 'No phone provided'}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <select 
                          className="form-select" 
                          onChange={(e) => assignStaff(selectedRequest._id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Select Staff to Assign</option>
                          {staffList.map(staff => (
                            <option key={staff._id} value={staff._id}>{staff.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small text-uppercase fw-bold">Bill Amount (₹)</p>
                    <div className="input-group">
                      <input 
                        type="number" 
                        className="form-control" 
                        defaultValue={selectedRequest.billAmount}
                        onBlur={(e) => updateBillAmount(selectedRequest._id, e.target.value)}
                        placeholder="Enter amount"
                      />
                      <span className="input-group-text">₹</span>
                    </div>
                    <small className="text-muted">Changes saved on blur</small>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small text-uppercase fw-bold">Payment Status</p>
                    <div className={`badge ${selectedRequest.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'} fs-6`}>
                      {selectedRequest.paymentStatus}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-3">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
