import { useEffect, useState } from "react";
import API from "../api/api";
import { generateServiceBillPDF } from "../utils/pdfGenerator";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

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

  return (
    <div className="container py-5">
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
                      <button 
                        className="btn btn-sm btn-dark"
                        onClick={() => generateServiceBillPDF(t)}
                      >
                        <i className="bi bi-download me-1"></i> Bill
                      </button>
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
