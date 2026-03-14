import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";

export default function GovernmentProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingTasks, setSavingTasks] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [pRes, bRes] = await Promise.all([
          API.get(`/government/${id}`),
          API.get(`/billing/project/${id}`)
        ]);
        setProject(pRes.data);
        setBills(Array.isArray(bRes.data) ? bRes.data : []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const expenses = useMemo(() => {
    return bills
      .filter(b => b?.status !== "Rejected")
      .reduce((sum, b) => sum + (Number(b?.grandTotal) || 0), 0);
  }, [bills]);

  const totalBudget = Number(project?.budget) || 0;
  const remainingBudget = totalBudget - expenses;
  const profit = remainingBudget;

  const budgetUsagePct = useMemo(() => {
    if (!totalBudget) return 0;
    const pct = (expenses / totalBudget) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [expenses, totalBudget]);

  const tasks = Array.isArray(project?.tasks) ? project.tasks : [];
  const completedTasks = tasks.filter(t => t?.status === "Completed").length;
  const workProgressPct = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const statusBadge = (status) => {
    if (status === "Completed") return "success";
    if (status === "In Progress") return "warning";
    return "secondary";
  };

  const saveTasks = async (nextTasks) => {
    if (!project) return;

    const prevProject = project;
    setProject({ ...project, tasks: nextTasks });
    setSavingTasks(true);
    setError("");

    try {
      const res = await API.put(`/government/${id}/tasks`, { tasks: nextTasks });
      setProject(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update tasks");
      setProject(prevProject);
    } finally {
      setSavingTasks(false);
    }
  };

  const addTask = async () => {
    const name = newTaskName.trim();
    if (!name) return;

    const nextTasks = [...tasks, { name, status: "Pending" }];
    setNewTaskName("");
    await saveTasks(nextTasks);
  };

  const updateTaskName = async (index, name) => {
    const nextTasks = [...tasks];
    nextTasks[index] = { ...nextTasks[index], name };
    await saveTasks(nextTasks);
  };

  const updateTaskStatus = async (index, status) => {
    const nextTasks = [...tasks];
    nextTasks[index] = { ...nextTasks[index], status };
    await saveTasks(nextTasks);
  };

  const removeTask = async (index) => {
    const nextTasks = tasks.filter((_, i) => i !== index);
    await saveTasks(nextTasks);
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex align-items-center gap-2 text-muted">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Loading project details...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => navigate("/government")}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <div className="alert alert-danger mb-0">{error || "Project not found"}</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
        <div>
          <button className="btn btn-outline-secondary mb-3" onClick={() => navigate("/government")}>
            <i className="bi bi-arrow-left me-2"></i>Back to Projects
          </button>
          <h2 className="fw-bold mb-1">{project.title}</h2>
          <div className="text-muted">
            {project.panchayatName || project.department || "-"} | {project.locationVillage || project.location || "-"}
          </div>
        </div>

        <div className="text-end">
          <span className="badge bg-success-subtle text-success fs-6">{project.status || "Ongoing"}</span>
          {savingTasks && (
            <div className="small text-muted mt-2">
              <span className="spinner-border spinner-border-sm me-2" role="status" />Saving...
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Budget Management</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded">
                    <div className="small text-muted">Total Budget</div>
                    <div className="fs-5 fw-bold">₹{totalBudget.toLocaleString()}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded">
                    <div className="small text-muted">Total Expenses</div>
                    <div className="fs-5 fw-bold text-danger">₹{expenses.toLocaleString()}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded">
                    <div className="small text-muted">Remaining Budget</div>
                    <div className={`fs-5 fw-bold ${remainingBudget >= 0 ? "text-success" : "text-danger"}`}>
                      ₹{remainingBudget.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded">
                    <div className="small text-muted">Profit Calculation</div>
                    <div className={`fs-5 fw-bold ${profit >= 0 ? "text-primary" : "text-danger"}`}>
                      ₹{profit.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="d-flex justify-content-between small text-muted mb-2">
                  <span>Budget usage</span>
                  <span>{budgetUsagePct.toFixed(0)}%</span>
                </div>
                <div className="progress" style={{ height: 10 }}>
                  <div
                    className={`progress-bar ${budgetUsagePct > 90 ? "bg-danger" : budgetUsagePct > 60 ? "bg-warning" : "bg-success"}`}
                    role="progressbar"
                    style={{ width: `${budgetUsagePct}%` }}
                    aria-valuenow={budgetUsagePct}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Work Progress</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Completion</span>
                <span>{workProgressPct}%</span>
              </div>
              <div className="progress mb-4" style={{ height: 10 }}>
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: `${workProgressPct}%` }}
                  aria-valuenow={workProgressPct}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>

              <div className="d-flex gap-2 mb-3">
                <input
                  className="form-control"
                  placeholder="Add task / work type (e.g., Pipe replacement)"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  disabled={savingTasks}
                />
                <button className="btn btn-primary" onClick={addTask} disabled={savingTasks || !newTaskName.trim()}>
                  Add
                </button>
              </div>

              <div className="list-group">
                {tasks.map((t, idx) => (
                  <div key={`${t.name}-${idx}`} className="list-group-item d-flex justify-content-between align-items-center gap-3">
                    <div className="flex-grow-1">
                      <input
                        className="form-control form-control-sm fw-semibold"
                        value={t.name}
                        onChange={(e) => {
                          const next = [...tasks];
                          next[idx] = { ...next[idx], name: e.target.value };
                          setProject({ ...project, tasks: next });
                        }}
                        onBlur={(e) => updateTaskName(idx, e.target.value.trim() || t.name)}
                        disabled={savingTasks}
                      />
                      <div className="mt-2">
                        <span className={`badge bg-${statusBadge(t.status)}`}>{t.status}</span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <select
                        className="form-select form-select-sm"
                        style={{ width: 150 }}
                        value={t.status}
                        onChange={(e) => updateTaskStatus(idx, e.target.value)}
                        disabled={savingTasks}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeTask(idx)} disabled={savingTasks}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <div className="text-muted">No tasks yet. Add tasks to start tracking progress.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
