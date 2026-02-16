import { useEffect, useState } from "react";
import API from "../api/api";
import { generateServiceBillPDF } from "../utils/pdfGenerator";
import "../styles/Projects.css";

export default function Projects() {
  const [requests, setRequests] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [savingBill, setSavingBill] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [bills, setBills] = useState([]);
  const [showBillForm, setShowBillForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [downloadingBill, setDownloadingBill] = useState(false);
  const [billForm, setBillForm] = useState({
    invoiceNo: "",
    billTo: {
      name: "",
      address: "",
      state: "Tamilnadu",
      stateCode: "33",
      gstin: "33CLPPB8841Q1ZF"
    },
    items: [{ description: "", unit: "", qty: 0, rate: 0, total: 0 }],
    cgstRate: 9,
    sgstRate: 9
  });

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
      setSavingBill(true);
      const res = await API.put("/requests/bill", { requestId, billAmount });
      alert("Bill amount updated successfully");
      setSelectedRequest(res.data);
      fetchRequests();
    } catch (err) {
      alert("Failed to update bill amount");
    } finally {
      setSavingBill(false);
    }
  };

  const updatePaymentStatus = async (requestId, paymentStatus) => {
    try {
      setSavingBill(true);
      const res = await API.put("/requests/payment-status", { requestId, paymentStatus });
      alert("Payment status updated successfully");
      setSelectedRequest(res.data);
      fetchRequests();
    } catch (err) {
      alert("Failed to update payment status");
    } finally {
      setSavingBill(false);
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

  const fetchBills = async (requestId) => {
    try {
      const res = await API.get(`/request-billing/request/${requestId}`);
      setBills(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadLatestApprovedBill = async (requestId) => {
    try {
      setDownloadingBill(true);
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
    } finally {
      setDownloadingBill(false);
    }
  };

  const openBilling = (request) => {
    setSelectedRequest(request);
    fetchBills(request._id);
    setShowBillForm(false);
    setEditingBill(null);
    setShowModal(false);
    setShowBilling(true);
  };

  const handleAddItem = () => {
    setBillForm({
      ...billForm,
      items: [...billForm.items, { description: "", unit: "", qty: 0, rate: 0, total: 0 }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...billForm.items];
    newItems[index][field] = value;
    if (field === "qty" || field === "rate") {
      newItems[index].total = newItems[index].qty * newItems[index].rate;
    }
    setBillForm({ ...billForm, items: newItems });
  };

  const calculateBillTotals = (items, cgstR, sgstR) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const cgstAmount = (subtotal * cgstR) / 100;
    const sgstAmount = (subtotal * sgstR) / 100;
    const grandTotal = subtotal + cgstAmount + sgstAmount;
    return { subtotal, cgstAmount, sgstAmount, grandTotal };
  };

  const saveBill = async () => {
    if (!selectedRequest) return;
    const totals = calculateBillTotals(billForm.items, billForm.cgstRate, billForm.sgstRate);
    const billData = {
      ...billForm,
      requestId: selectedRequest._id,
      ...totals
    };

    try {
      setSavingBill(true);
      if (editingBill) {
        await API.put(`/request-billing/${editingBill._id}`, billData);
        alert("Bill Updated");
      } else {
        await API.post("/request-billing", billData);
        alert("Bill Created");
      }
      setShowBillForm(false);
      setEditingBill(null);
      fetchBills(selectedRequest._id);
      fetchRequests();
    } catch (err) {
      alert("Failed to save bill");
    } finally {
      setSavingBill(false);
    }
  };

  const handleEditBill = (bill) => {
    setBillForm(bill);
    setEditingBill(bill);
    setShowBillForm(true);
  };

  const handleUpdateBillStatus = async (billId, status) => {
    try {
      setSavingBill(true);
      await API.put(`/request-billing/${billId}`, { status });
      fetchBills(selectedRequest._id);
      fetchRequests();
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setSavingBill(false);
    }
  };

  if (showBilling && selectedRequest) {
    return (
      <div className="container py-4">
        <button
          className="btn btn-outline-secondary mb-4"
          onClick={() => setShowBilling(false)}
        >
          <i className="bi bi-arrow-left me-2"></i>Back to Requests
        </button>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Billings for</h2>
          <button className="btn btn-primary" onClick={() => {
            setBillForm({
              invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
              billTo: {
                name: selectedRequest.name || "",
                address: "",
                state: "Tamilnadu",
                stateCode: "33",
                gstin: "33CLPPB8841Q1ZF"
              },
              items: [{ description: "", unit: "", qty: 0, rate: 0, total: 0 }],
              cgstRate: 9,
              sgstRate: 9
            });
            setEditingBill(null);
            setShowBillForm(true);
          }}>
            Generate New Bill
          </button>
        </div>

        {showBillForm && (
          <div className="card p-4 shadow-lg mb-5 border-0">
            <h4 className="mb-4">Generate Bill</h4>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label">Invoice No</label>
                <input className="form-control" value={billForm.invoiceNo} onChange={e => setBillForm({ ...billForm, invoiceNo: e.target.value })} />
              </div>
              <div className="col-md-8">
                <label className="form-label">Client Name (Bill To)</label>
                <input className="form-control" value={billForm.billTo.name} onChange={e => setBillForm({ ...billForm, billTo: { ...billForm.billTo, name: e.target.value } })} />
              </div>
              <div className="col-12">
                <label className="form-label">Client Address</label>
                <textarea className="form-control" rows="2" value={billForm.billTo.address} onChange={e => setBillForm({ ...billForm, billTo: { ...billForm.billTo, address: e.target.value } })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">GSTIN</label>
                <input className="form-control" value="33CLPPB8841Q1ZF" disabled />
              </div>
            </div>

            <h5 className="mb-3">Bill Items</h5>
            <div className="table-responsive mb-3">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Description</th>
                    <th style={{width: '100px'}}>Unit</th>
                    <th style={{width: '100px'}}>Qty</th>
                    <th style={{width: '120px'}}>Rate</th>
                    <th style={{width: '150px'}}>Total</th>
                    <th style={{width: '50px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {billForm.items.map((item, idx) => (
                    <tr key={idx}>
                      <td><input className="form-control border-0" value={item.description} onChange={e => handleItemChange(idx, "description", e.target.value)} /></td>
                      <td><input className="form-control border-0" value={item.unit} onChange={e => handleItemChange(idx, "unit", e.target.value)} /></td>
                      <td><input type="number" className="form-control border-0" value={item.qty} onChange={e => handleItemChange(idx, "qty", parseFloat(e.target.value) || 0)} /></td>
                      <td><input type="number" className="form-control border-0" value={item.rate} onChange={e => handleItemChange(idx, "rate", parseFloat(e.target.value) || 0)} /></td>
                      <td className="fw-bold">{item.total.toFixed(2)}</td>
                      <td>
                        <button className="btn btn-sm text-danger" onClick={() => {
                          const newItems = billForm.items.filter((_, i) => i !== idx);
                          setBillForm({ ...billForm, items: newItems });
                        }}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn btn-sm btn-outline-primary" onClick={handleAddItem}>+ Add Item</button>
            </div>

            <div className="row justify-content-end">
              <div className="col-md-4">
                <div className="card p-3 bg-light border-0">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>{calculateBillTotals(billForm.items, billForm.cgstRate, billForm.sgstRate).subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 align-items-center">
                    <span>CGST (9%):</span>
                    <span>{calculateBillTotals(billForm.items, billForm.cgstRate, billForm.sgstRate).cgstAmount.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 align-items-center">
                    <span>SGST (9%):</span>
                    <span>{calculateBillTotals(billForm.items, billForm.cgstRate, billForm.sgstRate).sgstAmount.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold border-top pt-2">
                    <span>Grand Total:</span>
                    <span className="text-primary">{calculateBillTotals(billForm.items, billForm.cgstRate, billForm.sgstRate).grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-success px-4" onClick={saveBill} disabled={savingBill}>Save Bill</button>
              <button className="btn btn-light px-4" onClick={() => setShowBillForm(false)} disabled={savingBill}>Cancel</button>
            </div>
          </div>
        )}

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-bold">Project Billings</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4">Invoice No</th>
                    <th>Bill To</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(b => (
                    <tr key={b._id}>
                      <td className="px-4 fw-bold">{b.invoiceNo}</td>
                      <td>{b.billTo?.name}</td>
                      <td className="fw-bold text-primary">₹{Number(b.grandTotal || 0).toFixed(2)}</td>
                      <td>
                        <span className={`badge bg-${b.status === 'Approved' ? 'success' : b.status === 'Rejected' ? 'danger' : 'warning'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => handleEditBill(b)} disabled={savingBill}><i className="bi bi-pencil"></i></button>
                          <button className="btn btn-outline-success" onClick={() => handleUpdateBillStatus(b._id, 'Approved')} disabled={savingBill}><i className="bi bi-check-lg"></i></button>
                          <button className="btn btn-outline-danger" onClick={() => handleUpdateBillStatus(b._id, 'Rejected')} disabled={savingBill}><i className="bi bi-x-lg"></i></button>
                          <button className="btn btn-dark" onClick={() => generateServiceBillPDF(b)} disabled={savingBill}><i className="bi bi-download"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bills.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">No bills generated for this request.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  <button className="btn btn-sm btn-outline-success flex-grow-1" onClick={() => openBilling(r)}>Manage Billings</button>
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
                        disabled={savingBill}
                      />
                      <span className="input-group-text">₹</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">Changes saved on blur</small>
                      <button className="btn btn-sm btn-outline-success" onClick={() => openBilling(selectedRequest)}>
                        Manage Billings
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small text-uppercase fw-bold">Payment Status</p>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <div className={`badge ${selectedRequest.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'} fs-6`}>
                        {selectedRequest.paymentStatus}
                      </div>
                      <div className="btn-group btn-group-sm" role="group" aria-label="Manage Billing">
                        <button
                          type="button"
                          className={`btn ${selectedRequest.paymentStatus === 'Paid' ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={() => updatePaymentStatus(selectedRequest._id, 'Paid')}
                          disabled={savingBill}
                        >
                          Mark Paid
                        </button>
                        <button
                          type="button"
                          className={`btn ${selectedRequest.paymentStatus !== 'Paid' ? 'btn-warning' : 'btn-outline-warning'}`}
                          onClick={() => updatePaymentStatus(selectedRequest._id, 'Unpaid')}
                          disabled={savingBill}
                        >
                          Mark Unpaid
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-3">
                {selectedRequest.billAmount > 0 && (
                  <button
                    type="button"
                    className="btn btn-dark px-4"
                    onClick={() => downloadLatestApprovedBill(selectedRequest._id)}
                    disabled={downloadingBill}
                  >
                    <i className="bi bi-download me-2"></i>Download Bill
                  </button>
                )}
                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
