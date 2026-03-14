import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import { generateServiceBillPDF } from "../utils/pdfGenerator";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [paymentNotice, setPaymentNotice] = useState(null);
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
      const res = await API.get("/requests");
      // Filter requests that have a bill amount (meaning they are transactions)
      const billedRequests = res.data.filter(r => r.billAmount > 0);
      setTransactions(billedRequests);
    } catch (err) {
      console.log("Error fetching transactions", err);
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

  return (
    <div className="container py-5">
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
          <h2 className="fw-bold">Transaction History</h2>
          <p className="text-muted">Track all your service payments and billing history.</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Transaction ID</th>
                  <th>Service</th>
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
                      <code className="text-primary fw-bold">#{t._id.toString().slice(-8).toUpperCase()}</code>
                    </td>
                    <td>
                      <div className="fw-bold text-capitalize">{t.serviceType}</div>
                      <div className="small text-muted">{t.name}</div>
                    </td>
                    <td className="fw-bold">₹{t.billAmount.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${t.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                        {t.paymentStatus}
                      </span>
                    </td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
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
                      <i className="bi bi-receipt fs-1 d-block mb-3"></i>
                      No transaction history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-light rounded-3">
        <h5 className="fw-bold mb-3">Payment Tracking</h5>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3">
              <div className="text-muted small mb-1">Total Billed</div>
              <div className="fs-4 fw-bold text-primary">₹{transactions.reduce((sum, t) => sum + t.billAmount, 0).toLocaleString()}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3">
              <div className="text-muted small mb-1">Paid Amount</div>
              <div className="fs-4 fw-bold text-success">
                ₹{transactions.filter(t => t.paymentStatus === 'Paid').reduce((sum, t) => sum + t.billAmount, 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3">
              <div className="text-muted small mb-1">Pending Payment</div>
              <div className="fs-4 fw-bold text-warning">
                ₹{transactions.filter(t => t.paymentStatus !== 'Paid').reduce((sum, t) => sum + t.billAmount, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
