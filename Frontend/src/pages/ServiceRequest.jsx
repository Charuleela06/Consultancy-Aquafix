import { useEffect, useState } from "react";
import API from "../api/api";
import { generateServiceBillPDF } from "../utils/pdfGenerator";
import "../styles/ServiceRequest.css";

export default function ServiceRequest() {
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", address: "", serviceType: "", message: "" });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!form.name || !form.email || !form.phoneNumber || !form.address || !form.serviceType) return alert("Please fill all required fields");
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      data.append("phoneNumber", form.phoneNumber);
      data.append("address", form.address);
      data.append("serviceType", form.serviceType);
      data.append("message", form.message);
      if (imageFile) {
        data.append("image", imageFile);
      }

      await API.post("/requests", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Request submitted successfully!");
      setForm({ name: "", email: "", phoneNumber: "", address: "", serviceType: "", message: "" });
      setImageFile(null);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Submission failed";
      alert("Submission failed: " + errorMsg);
      console.error("Error submitting request", err);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
          <div className="card shadow-lg p-5 mb-5 border-0">
            <h2 className="text-center mb-4 fw-bold">Service Request Form</h2>
            <p className="text-center text-muted mb-5">Fill out the form below and we'll get back to you as soon as possible.</p>
            
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">Full Name</label>
                <input 
                  className="form-control" 
                  placeholder="John Doe" 
                  value={form.name}
                  onChange={e => setForm({...form, name:e.target.value})}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Email Address</label>
                <input 
                  type="email"
                  className="form-control" 
                  placeholder="john@example.com" 
                  value={form.email}
                  onChange={e => setForm({...form, email:e.target.value})}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Phone Number</label>
                <input 
                  className="form-control" 
                  placeholder="+1 (555) 000-0000" 
                  value={form.phoneNumber}
                  onChange={e => setForm({...form, phoneNumber:e.target.value})}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Address</label>
                <input 
                  className="form-control" 
                  placeholder="Address" 
                  value={form.address}
                  onChange={e => setForm({...form, address:e.target.value})}
                />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold">Service Type</label>
                <select 
                  className="form-select"
                  value={form.serviceType}
                  onChange={e => setForm({...form, serviceType:e.target.value})}
                >
                  <option value="">Select a service...</option>
                  <option value="electrical">Electrical Work</option>
                  <option value="plumbing">Plumbing Work</option>
                  <option value="maintenance">General Maintenance</option>
                  <option value="consultation">Project Consultation</option>
                </select>
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold">Detailed Message</label>
                <textarea 
                  className="form-control" 
                  rows="4"
                  placeholder="Tell us more about your requirements..." 
                  value={form.message}
                  onChange={e => setForm({...form, message:e.target.value})}
                />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold">Upload Image (optional)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="col-md-12 text-center mt-4">
                <button className="btn btn-primary btn-lg px-5 shadow" onClick={submit}>Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
