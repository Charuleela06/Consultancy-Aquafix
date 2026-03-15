import { useEffect, useState } from "react";
import API from "../api/api";
import { generateServiceBillPDF } from "../utils/pdfGenerator";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequestImageUrl, setSelectedRequestImageUrl] = useState(null);

  useEffect(() => {
    fetchRequests();
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

  useEffect(() => {
    let active = true;

    const fetchImage = async () => {
      if (!showModal || !selectedRequest?._id) return;

      try {
        const res = await API.get(`/requests/${selectedRequest._id}/image`, {
          responseType: "blob"
        });
        const url = URL.createObjectURL(res.data);
        if (active) setSelectedRequestImageUrl(url);
      } catch (e) {
        if (active) setSelectedRequestImageUrl(null);
      }
    };

    fetchImage();

    return () => {
      active = false;
      if (selectedRequestImageUrl) {
        URL.revokeObjectURL(selectedRequestImageUrl);
      }
    };
  }, [showModal, selectedRequest]);

  return (
    <div className="container py-5">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="card shadow-sm p-4 border-0">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="mb-1 fw-bold">Operations Hu</h3>
            <div className="text-muted small"> Access and manage all your maintenance requests here</div>
          </div>
          <button className="btn btn-outline-primary btn-sm" onClick={fetchRequests}>
            Refresh
          </button>
        </div>

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
                {requests.map((r) => (
                  <tr key={r._id}>
                    <td className="text-capitalize fw-bold">{r.serviceType}</td>
                    <td>{r.phoneNumber}</td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === "Pending"
                            ? "bg-warning"
                            : r.status === "Completed"
                              ? "bg-success"
                              : "bg-primary"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>{r.assignedStaff ? r.assignedStaff.name : "Not Assigned"}</td>
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
                            onClick={() => generateServiceBillPDF(r)}
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
                    <td colSpan="6" className="text-center text-muted py-4">
                      No requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Request Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                {selectedRequestImageUrl && (
                  <div className="mb-3">
                    <label className="text-muted small d-block">Uploaded Image</label>
                    <img
                      src={selectedRequestImageUrl}
                      alt="Request"
                      className="img-fluid rounded border"
                    />
                  </div>
                )}
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
                  <label className="text-muted small d-block">Address</label>
                  <p className="bg-light p-3 rounded mb-0">{selectedRequest.address || "N/A"}</p>
                </div>
                <div className="mb-3">
                  <label className="text-muted small d-block">Message/Requirements</label>
                  <p className="bg-light p-3 rounded mb-0">{selectedRequest.message || "No specific requirements mentioned."}</p>
                </div>
                <hr />
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="text-muted small d-block">Assigned Staff</label>
                    <span className={`fw-bold ${selectedRequest.assignedStaff ? "text-dark" : "text-danger"}`}>
                      {selectedRequest.assignedStaff ? selectedRequest.assignedStaff.name : "Not Assigned"}
                    </span>
                  </div>
                  <div className="col-6">
                    <label className="text-muted small d-block">Staff Contact</label>
                    <span className="fw-bold">{selectedRequest.assignedStaff?.phoneNumber || "N/A"}</span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <label className="text-muted small d-block">Bill Amount</label>
                    <span className="fw-bold text-success fs-5">
                      {selectedRequest.billAmount > 0 ? `₹${selectedRequest.billAmount.toLocaleString()}` : "Awaiting Quote"}
                    </span>
                  </div>
                  <div className="col-6">
                    <label className="text-muted small d-block">Payment Status</label>
                    <span
                      className={`badge ${selectedRequest.paymentStatus === "Paid" ? "bg-success" : "bg-warning"}`}
                    >
                      {selectedRequest.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>
                  Close
                </button>
                {selectedRequest.billAmount > 0 && (
                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    onClick={() => generateServiceBillPDF(selectedRequest)}
                  >
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
