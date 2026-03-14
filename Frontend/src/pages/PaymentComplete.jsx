import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function PaymentComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Checking payment...");

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
        <div className="col-md-8">
          <div className={`alert ${status === "success" ? "alert-success" : status === "cancel" ? "alert-warning" : status === "error" ? "alert-danger" : "alert-info"}`} role="alert">
            <h4 className="alert-heading">Payment Status</h4>
            <p className="mb-0">{message}</p>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={() => navigate("/transactions")}>Go to Transactions</button>
            <button className="btn btn-outline-secondary" onClick={() => navigate("/home")}>Go to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
}
