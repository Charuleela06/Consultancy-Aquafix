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
    <div className="service-request-container py-5">
      <div className="app-blob blue" style={{ top: "-100px", left: "-100px", opacity: 0.3 }}></div>
      <div className="app-blob pink" style={{ bottom: "-100px", right: "-100px", opacity: 0.2 }}></div>
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <div className="text-center mb-5 app-slide-up">
              <h1 className="display-4 fw-bold mb-3">Service Request</h1>
              <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
                Need professional help? Fill out the details below and our expert team will get in touch with you shortly.
              </p>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show border-0 shadow-sm mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError(null)}></button>
              </div>
            )}

            <div className="form-card app-pop">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label className="form-label-custom">
                      <i className="bi bi-person me-2"></i>Full Name
                    </label>
                    <input 
                      className="form-control form-control-lg" 
                      placeholder="Enter your full name" 
                      value={form.name}
                      onChange={e => setForm({...form, name:e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label className="form-label-custom">
                      <i className="bi bi-envelope me-2"></i>Email Address
                    </label>
                    <input 
                      type="email"
                      className="form-control form-control-lg" 
                      placeholder="example@email.com" 
                      value={form.email}
                      onChange={e => setForm({...form, email:e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label className="form-label-custom">
                      <i className="bi bi-telephone me-2"></i>Phone Number
                    </label>
                    <input 
                      className="form-control form-control-lg" 
                      placeholder="+1 (555) 000-0000" 
                      value={form.phoneNumber}
                      onChange={e => setForm({...form, phoneNumber:e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label className="form-label-custom">
                      <i className="bi bi-geo-alt me-2"></i>Address
                    </label>
                    <input 
                      className="form-control form-control-lg" 
                      placeholder="Street, City, Zip" 
                      value={form.address}
                      onChange={e => setForm({...form, address:e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-group-custom">
                    <label className="form-label-custom">
                      <i className="bi bi-tools me-2"></i>Service Category
                    </label>
                    <select 
                      className="form-select form-select-lg"
                      value={form.serviceType}
                      onChange={e => setForm({...form, serviceType:e.target.value})}
                    >
                      <option value="">Choose a service category</option>
                      <option value="electrical">⚡ Electrical Solutions</option>
                      <option value="plumbing">🚰 Professional Plumbing</option>
                      <option value="maintenance">🛠️ General Maintenance</option>
                      <option value="consultation">📋 Expert Consultation</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-group-custom">
                    <label className="form-label-custom">
                      <i className="bi bi-chat-dots me-2"></i>How can we help?
                    </label>
                    <textarea 
                      className="form-control form-control-lg" 
                      rows="4"
                      placeholder="Briefly describe your requirements..." 
                      value={form.message}
                      onChange={e => setForm({...form, message:e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-group-custom">
                    <label className="form-label-custom">
                      <i className="bi bi-image me-2"></i>Upload Reference Image
                    </label>
                    <div className="upload-container">
                      <input
                        type="file"
                        id="file-upload"
                        className="file-input-hidden"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="file-upload" className="file-upload-label">
                        <i className="bi bi-cloud-arrow-up fs-2 mb-2"></i>
                        <span>{imageFile ? imageFile.name : "Click to browse or drag & drop"}</span>
                        <small className="text-muted mt-1">Supports: JPG, PNG, GIF</small>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-md-12 text-center mt-5">
                  <button className="btn btn-primary btn-lg px-5 py-3 shadow-lg w-100 w-md-auto" onClick={submit}>
                    <i className="bi bi-send-fill me-2"></i>Submit Service Request
                  </button>
                  <p className="mt-4 text-muted small">
                    <i className="bi bi-shield-lock me-1"></i> Your information is safe and secure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
