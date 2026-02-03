import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      alert("Login successful");
      if (res.data.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="card p-4 shadow-lg border-0" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="text-center mb-4">
          <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
            <i className="bi bi-person-lock fs-2"></i>
          </div>
          <h2 className="fw-bold">Member Login</h2>
          <p className="text-muted small">Access your dashboard and projects</p>
        </div>
        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input 
            type="email" 
            className="form-control" 
            placeholder="name@example.com" 
            onChange={e => setEmail(e.target.value)} 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-control" 
            placeholder="Password" 
            onChange={e => setPassword(e.target.value)} 
          />
        </div>
        <button className="btn btn-primary w-100 mt-2" onClick={login}>Login</button>
        <p className="text-center mt-3">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
}
