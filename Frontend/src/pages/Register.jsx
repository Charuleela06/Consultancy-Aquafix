import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/Register.css";

export default function Register() {
  const [form, setForm] = useState({ role: "user" });
  const navigate = useNavigate();

  const register = async () => {
    try {
      await API.post("/auth/register", form);
      alert("Registered successfully");
      navigate("/");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="card p-4 shadow-lg border-0" style={{ width: "100%", maxWidth: "450px" }}>
        <div className="text-center mb-4">
          <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
            <i className="bi bi-person-plus-fill fs-2"></i>
          </div>
          <h2 className="fw-bold">Create Account</h2>
          <p className="text-muted small">Join our network of professional contractors</p>
        </div>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input 
            className="form-control" 
            placeholder="John Doe" 
            onChange={e => setForm({...form, name:e.target.value})}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input 
            className="form-control" 
            placeholder="name@example.com" 
            onChange={e => setForm({...form, email:e.target.value})}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-control" 
            placeholder="Password" 
            onChange={e => setForm({...form, password:e.target.value})}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select className="form-select" onChange={e => setForm({...form, role:e.target.value})}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button className="btn btn-primary w-100 mt-2" onClick={register}>Register</button>
        <p className="text-center mt-3">
          Already have an account? <a href="/">Login here</a>
        </p>
      </div>
    </div>
  );
}
