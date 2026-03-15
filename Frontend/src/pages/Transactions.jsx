import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import { generateServiceBillPDF } from "../utils/pdfGenerator";
import "../styles/Transactions.css";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get("payment");
    const requestId = params.get("requestId");
    if (!payment) return;

    if (payment === "success") {
      setPaymentNotice({ type: "success", text: "Payment completed. Updating status...", requestId });
    } else if (payment === "cancel") {
      setPaymentNotice({ type: "warning", text: "Payment cancelled.", requestId });
    }

    fetchTransactions();

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      await fetchTransactions();
      if (attempts >= 10) {
        clearInterval(interval);
      }
    }, 1500);

    navigate("/transactions", { replace: true });

    return () => clearInterval(interval);
  }, [location.search]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await API.get("/requests");
      // Filter requests that have a bill amount (meaning they are transactions)
      const billedRequests = res.data.filter(r => r.billAmount > 0);
      setTransactions(billedRequests);
    } catch (err) {
      console.log("Error fetching transactions", err);
    } finally {
      setLoading(false);
    }
  };

  const payNow = async (requestId) => {
    try {
      const res = await API.post("/stripe/checkout-session", { requestId });
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      alert("Failed to start payment");
    } catch (err) {
      alert("Failed to start payment: " + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="status-badge status-paid">Paid</span>;
      case 'Unpaid':
        return <span className="status-badge status-pending">Pending</span>;
      case 'Failed':
        return <span className="status-badge status-failed">Failed</span>;
      default:
        return <span className="status-badge status-pending">{status}</span>;
    }
  };

  const totalBilled = transactions.reduce((sum, t) => sum + t.billAmount, 0);
  const totalPaid = transactions.filter(t => t.paymentStatus === 'Paid').reduce((sum, t) => sum + t.billAmount, 0);
  const totalPending = transactions.filter(t => t.paymentStatus !== 'Paid').reduce((sum, t) => sum + t.billAmount, 0);

  return (
    <div className="transactions-container">
      {paymentNotice && (
        <div className={`alert alert-${paymentNotice.type} d-flex justify-content-between align-items-center`} role="alert">
          <div>{paymentNotice.text}</div>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setPaymentNotice(null)}>
            Close
          </button>
        </div>
      )}

      <div className="row mb-4">
        <div className="col">
          <h1 className="transactions-title">Transactions & Payments</h1>
          <p className="transactions-subtitle">Track all your service payments and billing history.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-5">
        <div className="col-lg-4 mb-3">
          <div className="summary-card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="summary-icon">
                  <i className="bi bi-receipt"></i>
                </div>
                <div className="ms-3">
                  <h3 className="summary-value">₹{totalBilled.toLocaleString()}</h3>
                  <p className="summary-label">Total Billed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-3">
          <div className="summary-card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="summary-icon success">
                  <i className="bi bi-check-circle"></i>
                </div>
                <div className="ms-3">
                  <h3 className="summary-value">₹{totalPaid.toLocaleString()}</h3>
                  <p className="summary-label">Paid Amount</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-3">
          <div className="summary-card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="summary-icon warning">
                  <i className="bi bi-clock"></i>
                </div>
                <div className="ms-3">
                  <h3 className="summary-value">₹{totalPending.toLocaleString()}</h3>
                  <p className="summary-label">Pending Payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-card">
        <div className="card-header">
          <h5 className="mb-0">Transaction History</h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Invoice ID</th>
                    <th>Service Name</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t._id}>
                      <td className="ps-4">
                        <code className="invoice-id">#{t._id.toString().slice(-8).toUpperCase()}</code>
                      </td>
                      <td>
                        <div className="service-name">{t.serviceType}</div>
                        <div className="customer-name">{t.name}</div>
                      </td>
                      <td className="amount">₹{t.billAmount.toLocaleString()}</td>
                      <td>
                        {getStatusBadge(t.paymentStatus)}
                      </td>
                      <td className="date">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="text-end pe-4">
                        <div className="btn-group">
                          {t.paymentStatus !== 'Paid' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => payNow(t._id)}
                            >
                              Pay Now
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-dark"
                            onClick={() => generateServiceBillPDF(t)}
                          >
                            <i className="bi bi-download me-1"></i> Bill
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <div className="empty-state">
                          <i className="bi bi-receipt fs-1 d-block mb-3"></i>
                          <h5>No transactions found</h5>
                          <p>Transaction history will appear here once you have billed services.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
