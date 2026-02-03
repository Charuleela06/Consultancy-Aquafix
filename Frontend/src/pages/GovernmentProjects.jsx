import { useEffect, useState } from "react";
import API from "../api/api";
import { generateBillPDF } from "../utils/pdfGenerator";
import "../styles/GovernmentProjects.css";

export default function GovernmentProjects() {
  const [projects, setProjects] = useState([]);
  const [showBilling, setShowBilling] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bills, setBills] = useState([]);
  const [showBillForm, setShowBillForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  
  const [projectForm, setProjectForm] = useState({ 
    title: "", 
    department: "", 
    location: "", 
    workType: "",
    budget: "" 
  });

  const [billForm, setBillForm] = useState({
    invoiceNo: "",
    billTo: {
      name: "",
      address: "",
      state: "Tamilnadu",
      stateCode: "33",
      gstin: "33CLPPB8841Q1ZF"
    },
    items: [{ description: "", unit: "", qty: 0, rate: 0, total: 0 }],
    cgstRate: 9,
    sgstRate: 9
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/government");
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBills = async (projectId) => {
    try {
      const res = await API.get(`/billing/project/${projectId}`);
      setBills(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addProject = async () => {
    if (!projectForm.title || !projectForm.department) return alert("Title and Department are required");
    try {
      await API.post("/government", projectForm);
      alert("Project Added");
      fetchProjects();
      setProjectForm({ title: "", department: "", location: "", workType: "", budget: "" });
    } catch (err) {
      alert("Failed to add project");
    }
  };

  const handleViewBilling = (project) => {
    setSelectedProject(project);
    fetchBills(project._id);
    setShowBilling(true);
  };

  const handleAddItem = () => {
    setBillForm({
      ...billForm,
      items: [...billForm.items, { description: "", unit: "", qty: 0, rate: 0, total: 0 }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...billForm.items];
    newItems[index][field] = value;
    if (field === "qty" || field === "rate") {
      newItems[index].total = newItems[index].qty * newItems[index].rate;
    }
    setBillForm({ ...billForm, items: newItems });
  };

  const calculateBillTotals = (items, cgstR, sgstR) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const cgstAmount = (subtotal * cgstR) / 100;
    const sgstAmount = (subtotal * sgstR) / 100;
    const grandTotal = subtotal + cgstAmount + sgstAmount;
    return { subtotal, cgstAmount, sgstAmount, grandTotal };
  };

  const saveBill = async () => {
    const totals = calculateBillTotals(billForm.items, billForm.cgstRate, billForm.sgstRate);
    const billData = {
      ...billForm,
      projectId: selectedProject._id,
      ...totals
    };

    try {
      if (editingBill) {
        await API.put(`/billing/${editingBill._id}`, billData);
        alert("Bill Updated");
      } else {
        await API.post("/billing", billData);
        alert("Bill Created");
      }
      setShowBillForm(false);
      setEditingBill(null);
      fetchBills(selectedProject._id);
      fetchProjects();
    } catch (err) {
      alert("Failed to save bill");
    }
  };

  const handleEditBill = (bill) => {
    setBillForm(bill);
    setEditingBill(bill);
    setShowBillForm(true);
  };

  const handleUpdateBillStatus = async (billId, status) => {
    try {
      await API.put(`/billing/${billId}`, { status });
      fetchBills(selectedProject._id);
      fetchProjects();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (showBilling) {
    return (
      <div className="container py-4">
        <button className="btn btn-outline-secondary mb-4" onClick={() => setShowBilling(false)}>
          <i className="bi bi-arrow-left me-2"></i>Back to Projects
        </button>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Billings for {selectedProject.title}</h2>
          <button className="btn btn-primary" onClick={() => {
            setBillForm({
              invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
              billTo: { name: "", address: "", state: "Tamilnadu", stateCode: "33", gstin: "" },
              items: [{ description: "", unit: "", qty: 0, rate: 0, total: 0 }],
              cgstRate: 9,
              sgstRate: 9
            });
            setEditingBill(null);
            setShowBillForm(true);
          }}>
            Generate New Bill
          </button>
        </div>

        {showBillForm && (
          <div className="card p-4 shadow-lg mb-5 border-0">
            <h4 className="mb-4">{editingBill ? "Edit Bill" : "Generate Bill"}</h4>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label">Invoice No</label>
                <input className="form-control" value={billForm.invoiceNo} onChange={e => setBillForm({...billForm, invoiceNo: e.target.value})} />
              </div>
              <div className="col-md-8">
                <label className="form-label">Client Name (Bill To)</label>
                <input className="form-control" value={billForm.billTo.name} onChange={e => setBillForm({...billForm, billTo: {...billForm.billTo, name: e.target.value}})} />
              </div>
              <div className="col-12">
                <label className="form-label">Client Address</label>
                <textarea className="form-control" rows="2" value={billForm.billTo.address} onChange={e => setBillForm({...billForm, billTo: {...billForm.billTo, address: e.target.value}})} />
              </div>
              <div className="col-md-4">
                <label className="form-label">GSTIN</label>
                <input className="form-control" value="33CLPPB8841Q1ZF" disabled />
              </div>
            </div>

            <h5 className="mb-3">Bill Items</h5>
            <div className="table-responsive mb-3">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Description</th>
                    <th style={{width: '100px'}}>Unit</th>
                    <th style={{width: '100px'}}>Qty</th>
                    <th style={{width: '120px'}}>Rate</th>
                    <th style={{width: '150px'}}>Total</th>
                    <th style={{width: '50px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {billForm.items.map((item, idx) => (
                    <tr key={idx}>
                      <td><input className="form-control border-0" value={item.description} onChange={e => handleItemChange(idx, "description", e.target.value)} /></td>
                      <td><input className="form-control border-0" value={item.unit} onChange={e => handleItemChange(idx, "unit", e.target.value)} /></td>
                      <td><input type="number" className="form-control border-0" value={item.qty} onChange={e => handleItemChange(idx, "qty", parseFloat(e.target.value) || 0)} /></td>
                      <td><input type="number" className="form-control border-0" value={item.rate} onChange={e => handleItemChange(idx, "rate", parseFloat(e.target.value) || 0)} /></td>
                      <td className="fw-bold">{item.total.toFixed(2)}</td>
                      <td>
                        <button className="btn btn-sm text-danger" onClick={() => {
                          const newItems = billForm.items.filter((_, i) => i !== idx);
                          setBillForm({...billForm, items: newItems});
                        }}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn btn-sm btn-outline-primary" onClick={handleAddItem}>+ Add Item</button>
            </div>

            <div className="row justify-content-end">
              <div className="col-md-4">
                <div className="card p-3 bg-light border-0">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>{billForm.items.reduce((sum, i) => sum + i.total, 0).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 align-items-center">
                    <span>CGST (9%):</span>
                    <span>{(billForm.items.reduce((sum, i) => sum + i.total, 0) * 0.09).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 align-items-center">
                    <span>SGST (9%):</span>
                    <span>{(billForm.items.reduce((sum, i) => sum + i.total, 0) * 0.09).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold border-top pt-2">
                    <span>Grand Total:</span>
                    <span className="text-primary">{(billForm.items.reduce((sum, i) => sum + i.total, 0) * 1.18).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-success px-4" onClick={saveBill}>Save Bill</button>
              <button className="btn btn-light px-4" onClick={() => setShowBillForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-bold">Project Billings</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4">Invoice No</th>
                    <th>Bill To</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(b => (
                    <tr key={b._id}>
                      <td className="px-4 fw-bold">{b.invoiceNo}</td>
                      <td>{b.billTo.name}</td>
                      <td className="fw-bold text-primary">₹{b.grandTotal.toFixed(2)}</td>
                      <td>
                        <span className={`badge bg-${b.status === 'Approved' ? 'success' : b.status === 'Rejected' ? 'danger' : 'warning'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => handleEditBill(b)}><i className="bi bi-pencil"></i></button>
                          <button className="btn btn-outline-success" onClick={() => handleUpdateBillStatus(b._id, 'Approved')}><i className="bi bi-check-lg"></i></button>
                          <button className="btn btn-outline-danger" onClick={() => handleUpdateBillStatus(b._id, 'Rejected')}><i className="bi bi-x-lg"></i></button>
                          <button className="btn btn-dark" onClick={() => generateBillPDF(b)}><i className="bi bi-download"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bills.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">No bills generated for this project.</td>
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

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="fw-bold text-primary">Government Projects</h1>
          <p className="text-muted">Public sector initiatives and billing management.</p>
        </div>
      </div>

      <div className="card p-4 shadow-sm mb-5 border-0">
        <h4 className="mb-3 fw-bold">Add New Project</h4>
        <div className="row g-3">
          <div className="col-md-4">
            <input className="form-control" placeholder="Project Title" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
          </div>
          <div className="col-md-4">
            <input className="form-control" placeholder="Department" value={projectForm.department} onChange={e => setProjectForm({...projectForm, department: e.target.value})} />
          </div>
          <div className="col-md-4">
            <input className="form-control" placeholder="Location" value={projectForm.location} onChange={e => setProjectForm({...projectForm, location: e.target.value})} />
          </div>
          <div className="col-md-4">
            <input className="form-control" placeholder="Work Type" value={projectForm.workType} onChange={e => setProjectForm({...projectForm, workType: e.target.value})} />
          </div>
          <div className="col-md-4">
            <input className="form-control" type="number" placeholder="Budget" value={projectForm.budget} onChange={e => setProjectForm({...projectForm, budget: e.target.value})} />
          </div>
          <div className="col-md-4">
            <button className="btn btn-primary w-100 fw-bold" onClick={addProject}>Add Project</button>
          </div>
        </div>
      </div>

      <div className="row">
        {projects.length > 0 ? (
          projects.map(p => (
            <div key={p._id} className="col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm overflow-hidden">
                <div className="bg-success py-2"></div>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between mb-3">
                    <h5 className="fw-bold mb-0">{p.title}</h5>
                    <span className="badge bg-success-subtle text-success">{p.status}</span>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted small"><i className="bi bi-building me-2"></i>{p.department}</div>
                    <div className="text-muted small"><i className="bi bi-geo-alt me-2"></i>{p.location}</div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="fw-bold text-primary">Budget: ₹{p.totalBilledAmount?.toLocaleString() || 0}</div>
                      {p.lastBillId && (
                        <button 
                          className="btn btn-sm btn-link p-0 text-danger fs-4" 
                          title="Download Last Approved Bill"
                          onClick={(e) => {
                            e.stopPropagation();
                            generateBillPDF(p.lastBillId);
                          }}
                        >
                          <i className="bi bi-file-earmark-pdf-fill"></i>
                        </button>
                      )}
                    </div>
                    <button className="btn btn-outline-success btn-sm px-4 rounded-pill" onClick={() => handleViewBilling(p)}>Manage Billings</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col text-center py-5">
            <p className="text-muted">No government projects found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
