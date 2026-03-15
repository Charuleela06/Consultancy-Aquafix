import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function PaymentComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Checking payment...");

  useEffect(() => {
    if (status !== "success" && status !== "cancel") return;
    const id = setTimeout(() => {
      navigate("/transactions", { replace: true });
    }, 1500);
    return () => clearTimeout(id);
  }, [status, navigate]);

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(location.search);
      const result = params.get("status");
      const sessionId = params.get("session_id");

      if (result === "cancel") {
        setStatus("cancel");
        setMessage("Payment cancelled.");
        return;
      }

      if (!sessionId) {
        setStatus("error");
        setMessage("Missing session id.");
        return;
      }

      try {
        const res = await API.get(`/stripe/verify?sessionId=${encodeURIComponent(sessionId)}`);
        if (res.data?.paymentStatus === "Paid") {
          setStatus("success");
          setMessage("Payment completed successfully.");
        } else {
          setStatus("pending");
          setMessage("Payment is not completed yet.");
        }
      } catch (e) {
        setStatus("error");
        setMessage(e.response?.data?.message || e.message || "Failed to verify payment");
      }
    };

    run();
  }, [location.search]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7 col-md-9">
          <div className="card border-0 shadow-lg overflow-hidden">
            <div className={`card-header border-0 py-4 ${status === "success" ? "bg-success" : status === "cancel" ? "bg-warning" : status === "error" ? "bg-danger" : "bg-primary"} text-white`}>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                    <i className={`bi ${status === "success" ? "bi-check2-circle" : status === "cancel" ? "bi-x-circle" : status === "error" ? "bi-exclamation-triangle" : "bi-credit-card"} fs-3`}></i>
                  </div>
                  <div>
                    <div className="fw-bold fs-4">Billing Hub</div>
                    <div className="small opacity-75">Secure checkout result</div>
                  </div>
                </div>
                <span className={`badge ${status === "success" ? "bg-light text-success" : status === "cancel" ? "bg-light text-dark" : status === "error" ? "bg-light text-danger" : "bg-light text-primary"} px-3 py-2`}>
                  {status === "success" ? "Completed" : status === "cancel" ? "Cancelled" : status === "error" ? "Failed" : "Processing"}
                </span>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              <h5 className="fw-bold mb-2">Payment Status</h5>
              <div className="text-muted mb-4">{message}</div>

              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-primary px-4" onClick={() => navigate("/transactions")}>
                  Go to Transactions
                </button>
                <button className="btn btn-outline-secondary px-4" onClick={() => navigate("/")}>
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
