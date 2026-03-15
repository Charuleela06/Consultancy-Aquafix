import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/StaffManagement.css";

export default function StaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [availableStaffIds, setAvailableStaffIds] = useState(new Set());
  const [assignedTasks, setAssignedTasks] = useState({});
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", role: "staff" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
    fetchAssignedTasks();
  }, []);

  const fetchStaff = async () => {
    try {
      const [allStaffRes, availableRes] = await Promise.all([
        API.get("/auth/staff"),
        API.get("/auth/staff/available")
      ]);
      setStaffList(allStaffRes.data);
      setAvailableStaffIds(new Set((availableRes.data || []).map((s) => s._id)));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      const res = await API.get("/requests");
      const tasks = {};
      res.data.forEach(request => {
        if (request.assignedStaff) {
          const staffId = request.assignedStaff._id;
          if (!tasks[staffId]) tasks[staffId] = [];
          tasks[staffId].push(request);
        }
      });
      setAssignedTasks(tasks);
    } catch (err) {
      console.log(err);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";
    let pass = "";
    for (let i = 0; i < 10; i += 1) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    return pass;
  };

  const addStaff = async () => {
    if (!form.name || !form.email || !form.phoneNumber) return alert("Please fill all fields");
    try {
      const password = generatePassword();
      await API.post("/auth/register", { ...form, password });
      alert("Staff added successfully. Temporary password: " + password);
      setForm({ name: "", email: "", phoneNumber: "", role: "staff" });
      fetchStaff();
    } catch (err) {
      alert("Failed to add staff");
    }
  };

  const getStaffTasks = (staffId) => {
    return assignedTasks[staffId] || [];
  };

  const getAvailabilityIcon = (staffId) => {
    const isAvailable = availableStaffIds.has(staffId);
    return isAvailable ? '🟢' : '🔴';
  };

  const getAvailabilityText = (staffId) => {
    const isAvailable = availableStaffIds.has(staffId);
    return isAvailable ? 'Available' : 'Busy';
  };

  return (
    <div className="staff-container">
      <div className="row mb-4">
        <div className="col">
          <h1 className="staff-title">Staff Management</h1>
          <p className="staff-subtitle">Add and manage consultancy staff members and their assignments.</p>
        </div>
      </div>

      {/* Add Staff Form */}
      <div className="add-staff-card mb-5">
        <div className="card-header">
          <h4 className="mb-0">Add New Staff Member</h4>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Full Name"
                value={form.name}
                onChange={e => setForm({...form, name:e.target.value})}
              />
            </div>
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Email Address"
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email:e.target.value})}
              />
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <input
                  className="form-control"
                  placeholder="Phone Number"
                  value={form.phoneNumber}
                  onChange={e => setForm({...form, phoneNumber:e.target.value})}
                />
                <button className="btn btn-primary" onClick={addStaff}>Add Staff</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Directory */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {staffList.length > 0 ? (
            staffList.map(staff => {
              const tasks = getStaffTasks(staff._id);
              const isAvailable = availableStaffIds.has(staff._id);

              return (
                <div key={staff._id} className="col-lg-4 col-md-6 mb-4">
                  <div className="staff-card">
                    <div className="card-header">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="staff-name">{staff.name}</h5>
                          <p className="staff-role">Staff Member</p>
                        </div>
                        <div className="availability-indicator">
                          <span className="availability-icon">{getAvailabilityIcon(staff._id)}</span>
                          <span className={`availability-text ${isAvailable ? 'available' : 'busy'}`}>
                            {getAvailabilityText(staff._id)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="staff-info">
                        <div className="info-item">
                          <i className="bi bi-envelope"></i>
                          <span>{staff.email}</span>
                        </div>
                        <div className="info-item">
                          <i className="bi bi-telephone"></i>
                          <span>{staff.phoneNumber}</span>
                        </div>
                      </div>

                      <div className="tasks-section">
                        <h6 className="tasks-title">Assigned Tasks ({tasks.length})</h6>
                        {tasks.length > 0 ? (
                          <div className="tasks-list">
                            {tasks.slice(0, 3).map(task => (
                              <div key={task._id} className="task-item">
                                <span className="task-service">{task.serviceType}</span>
                                <span className={`task-status status-${task.status.toLowerCase().replace(' ', '-')}`}>
                                  {task.status}
                                </span>
                              </div>
                            ))}
                            {tasks.length > 3 && (
                              <div className="more-tasks">+{tasks.length - 3} more tasks</div>
                            )}
                          </div>
                        ) : (
                          <p className="no-tasks">No tasks assigned</p>
                        )}
                      </div>
                    </div>
                    <div className="card-footer">
                      <button className="btn btn-outline-danger btn-sm">
                        <i className="bi bi-trash me-1"></i>Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col text-center py-5">
              <div className="empty-state">
                <i className="bi bi-people display-1 text-muted mb-4"></i>
                <h4>No staff members found</h4>
                <p className="text-muted">Add your first staff member to get started.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
