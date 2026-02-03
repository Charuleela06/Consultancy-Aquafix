import { useEffect, useState } from "react";
import API from "../api/api";

export default function StaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", password: "", role: "staff" });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await API.get("/auth/staff");
      setStaffList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addStaff = async () => {
    if (!form.name || !form.email || !form.phoneNumber || !form.password) return alert("Please fill all fields");
    try {
      await API.post("/auth/register", form);
      alert("Staff added successfully");
      setForm({ name: "", email: "", phoneNumber: "", password: "", role: "staff" });
      fetchStaff();
    } catch (err) {
      alert("Failed to add staff");
    }
  };

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="fw-bold text-primary">Staff Management</h1>
          <p className="text-muted">Add and manage consultancy staff members.</p>
        </div>
      </div>

      <div className="card p-4 shadow-sm mb-5 border-0">
        <h4 className="mb-3 fw-bold">Add New Staff</h4>
        <div className="row g-3">
          <div className="col-md-3">
            <input 
              className="form-control" 
              placeholder="Full Name" 
              value={form.name}
              onChange={e => setForm({...form, name:e.target.value})}
            />
          </div>
          <div className="col-md-3">
            <input 
              className="form-control" 
              placeholder="Email" 
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email:e.target.value})}
            />
          </div>
          <div className="col-md-3">
            <input 
              className="form-control" 
              placeholder="Phone Number" 
              value={form.phoneNumber}
              onChange={e => setForm({...form, phoneNumber:e.target.value})}
            />
          </div>
          <div className="col-md-3">
            <input 
              className="form-control" 
              placeholder="Password" 
              type="password"
              value={form.password}
              onChange={e => setForm({...form, password:e.target.value})}
            />
          </div>
          <div className="col-md-3">
            <button className="btn btn-primary w-100 fw-bold" onClick={addStaff}>Add Staff</button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">Staff Directory</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4">Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th className="text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.length > 0 ? (
                  staffList.map(s => (
                    <tr key={s._id}>
                      <td className="px-4 fw-bold">{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.phoneNumber}</td>
                      <td><span className="badge bg-info text-dark">Staff</span></td>
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">No staff members found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
