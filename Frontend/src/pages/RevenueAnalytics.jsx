import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = ["#0d6efd", "#198754", "#20c997", "#6f42c1", "#fd7e14", "#dc3545", "#0dcaf0"];

const formatINR = (n) => {
  const x = Number(n) || 0;
  return `₹${x.toLocaleString()}`;
};

export default function RevenueAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [data, setData] = useState({
    summary: { today: 0, week: 0, month: 0, total: 0 },
    daily: [],
    weekly: [],
    monthly: [],
    serviceBreakdown: [],
    bookings: []
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (serviceType) params.serviceType = serviceType;
      if (paymentMethod) params.paymentMethod = paymentMethod;

      const res = await API.get("/analytics/revenue", { params });
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load revenue analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const serviceTypeOptions = useMemo(() => {
    const unique = new Set();
    (data.bookings || []).forEach(b => {
      if (b?.serviceType) unique.add(b.serviceType);
    });
    return Array.from(unique).sort();
  }, [data.bookings]);

  const paymentMethodOptions = useMemo(() => {
    const unique = new Set();
    (data.bookings || []).forEach(b => {
      if (b?.paymentMethod) unique.add(b.paymentMethod);
    });
    return Array.from(unique).sort();
  }, [data.bookings]);

  const downloadCSV = (rows, filename) => {
    const header = Object.keys(rows?.[0] || {});
    const csv = [
      header.join(","),
      ...(rows || []).map(r => header.map(h => JSON.stringify(r?.[h] ?? "")).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, filename);
  };

  const downloadExcel = (rows, filename) => {
    const ws = XLSX.utils.json_to_sheet(rows || []);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([out], { type: "application/octet-stream" }), filename);
  };

  const downloadPDF = (rows, title, filename) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(title, 14, 16);

    const head = [Object.keys(rows?.[0] || {})];
    const body = (rows || []).map(r => Object.keys(rows?.[0] || {}).map(k => String(r?.[k] ?? "")));

    autoTable(doc, {
      head,
      body,
      startY: 22,
      styles: { fontSize: 9 }
    });

    doc.save(filename);
  };

  const bookingRows = useMemo(() => {
    return (data.bookings || []).map(b => ({
      Date: b?.date ? new Date(b.date).toLocaleDateString() : "",
      "Customer Name": b?.customerName || "",
      "Service Type": b?.serviceType || "",
      Amount: Number(b?.amount || 0),
      "Payment Method": b?.paymentMethod || "",
      Status: b?.status || ""
    }));
  }, [data.bookings]);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex align-items-center gap-2 text-muted">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Loading revenue analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 pb-5" style={{ background: "#f5f7fb" }}>
      <div className="pt-4 pb-3">
        <h2 className="fw-bold mb-1 text-primary">Revenue Analytics</h2>
        <div className="text-muted">Track revenue generated from service bookings.</div>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small text-muted">Date Range (Start)</label>
              <input className="form-control" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Date Range (End)</label>
              <input className="form-control" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Service Type</label>
              <select className="form-select" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                <option value="">All</option>
                {serviceTypeOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Payment Method</label>
              <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="">All</option>
                {paymentMethodOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary" onClick={fetchData}>
                <i className="bi bi-funnel me-2"></i>Apply Filters
              </button>
              <button className="btn btn-success" onClick={fetchData}>
                <i className="bi bi-arrow-clockwise me-2"></i>Refresh
              </button>
              <button className="btn btn-outline-secondary" onClick={() => {
                setStartDate("");
                setEndDate("");
                setServiceType("");
                setPaymentMethod("");
                setTimeout(fetchData, 0);
              }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Today&apos;s Revenue</div>
              <div className="fs-4 fw-bold text-success">{formatINR(data.summary.today)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Weekly Revenue</div>
              <div className="fs-4 fw-bold text-success">{formatINR(data.summary.week)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Monthly Revenue</div>
              <div className="fs-4 fw-bold text-success">{formatINR(data.summary.month)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Total Revenue</div>
              <div className="fs-4 fw-bold text-success">{formatINR(data.summary.total)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <div className="fw-bold">Daily Revenue</div>
            </div>
            <div className="card-body" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#0d6efd" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <div className="fw-bold">Service Revenue Breakdown</div>
            </div>
            <div className="card-body" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.serviceBreakdown || []}
                    dataKey="revenue"
                    nameKey="serviceType"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {(data.serviceBreakdown || []).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div className="fw-bold">Weekly / Monthly Revenue</div>
              <div className="text-muted small">Showing monthly by default</div>
            </div>
            <div className="card-body" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(data.monthly || []).slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#198754" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <div className="fw-bold">Download Reports</div>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary" onClick={() => downloadPDF(bookingRows, "Daily Revenue Report", "daily-revenue-report.pdf")}>
                  Daily Revenue Report (PDF)
                </button>
                <button className="btn btn-outline-primary" onClick={() => downloadExcel(bookingRows, "monthly-revenue-report.xlsx")}>
                  Monthly Revenue Report (Excel)
                </button>
                <button className="btn btn-outline-primary" onClick={() => downloadCSV(bookingRows, "full-revenue-report.csv")}>
                  Full Revenue Report (CSV)
                </button>
              </div>
              <div className="small text-muted mt-3">
                Exports include the filtered booking revenue table.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <div className="fw-bold">Booking Revenue Table</div>
            <div className="text-muted small">Completed & paid service bookings</div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-success" onClick={() => downloadCSV(bookingRows, "bookings.csv")}>
              <i className="bi bi-download me-2"></i>CSV
            </button>
            <button className="btn btn-sm btn-success" onClick={() => downloadExcel(bookingRows, "bookings.xlsx")}>
              <i className="bi bi-download me-2"></i>Excel
            </button>
            <button className="btn btn-sm btn-success" onClick={() => downloadPDF(bookingRows, "Booking Revenue", "bookings.pdf")}>
              <i className="bi bi-download me-2"></i>PDF
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4">Date</th>
                  <th>Customer Name</th>
                  <th>Service Type</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.bookings || []).map((b, idx) => (
                  <tr key={idx}>
                    <td className="px-4">{b?.date ? new Date(b.date).toLocaleDateString() : ""}</td>
                    <td className="fw-semibold">{b?.customerName}</td>
                    <td>{b?.serviceType}</td>
                    <td className="fw-bold text-success">{formatINR(b?.amount)}</td>
                    <td>{b?.paymentMethod}</td>
                    <td>
                      <span className="badge bg-success-subtle text-success">{b?.status}</span>
                    </td>
                  </tr>
                ))}

                {(data.bookings || []).length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No revenue data found for selected filters.</td>
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
