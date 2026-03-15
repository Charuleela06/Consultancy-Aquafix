import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/Register.css";

export default function Register() {
  const [form, setForm] = useState({ role: "user" });
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toLowerCase();

  useEffect(() => {
    if (token) {
      if (role === "admin") navigate("/dashboard");
      else navigate("/request");
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const google = window.google;

    if (!clientId || !google?.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const res = await API.post("/auth/google", { credential: response.credential });
          localStorage.setItem("token", res.data.token);
          const userRole = res.data.user?.role || "user";
          localStorage.setItem("role", userRole);
          if (userRole === "admin") navigate("/dashboard");
          else navigate("/");
        } catch (err) {
          alert("Google sign up failed: " + (err.response?.data?.message || "Try again"));
        }
      }
    });

    const el = document.getElementById("googleRegisterBtn");
    if (el) {
      el.innerHTML = "";
      google.accounts.id.renderButton(el, {
        theme: "outline",
        size: "large",
        width: 380,
        text: "continue_with"
      });
    }
  }, [navigate, token, role]);

  const register = async () => {
    try {
      await API.post("/auth/register", form);
      alert("Registered successfully");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card p-4 shadow-lg border-0" style={{ width: "100%", maxWidth: "450px" }}>
        <div className="text-center mb-4">
          <div className="bg-navbar-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
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
          <select className="form-select" value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button className="btn btn-navbar w-100 mt-2" onClick={register}>Register</button>
        <div className="text-center my-3 text-muted small">or</div>
        <div className="d-flex justify-content-center">
          <div id="googleRegisterBtn"></div>
        </div>
        <p className="text-center mt-3">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}
