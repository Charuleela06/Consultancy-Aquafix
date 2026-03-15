import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import API from "../api/api";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState({
    totalServiceRequests: 0,
    completedRequests: 0,
    totalRevenue: 0,
    staffSalaryExpenses: 0,
    governmentProjectBudgets: 0,
    pendingPayments: 0,
    totalProjects: 0,
    pendingRequests: 0,
    govtProjects: 0,
    activeTasks: 0
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [serviceTrends, setServiceTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsRes = await API.get("/stats");
        setStatsData(statsRes.data);

        // Fetch revenue analytics for charts
        const analyticsRes = await API.get("/analytics/revenue");
        const monthlyData = analyticsRes.data.monthly.map(item => ({
          month: item.period,
          revenue: item.revenue
        }));
        setMonthlyRevenue(monthlyData);

        // Service request trends (mock data for now, can be enhanced)
        const trends = [
          { month: 'Jan', requests: 12 },
          { month: 'Feb', requests: 19 },
          { month: 'Mar', requests: 15 },
          { month: 'Apr', requests: 25 },
          { month: 'May', requests: 22 },
          { month: 'Jun', requests: 30 }
        ];
        setServiceTrends(trends);

        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { title: "Total Service Requests", value: statsData.totalServiceRequests, icon: "bi-clipboard-check", color: "primary" },
    { title: "Completed Requests", value: statsData.completedRequests, icon: "bi-check-circle", color: "success" },
    { title: "Total Revenue", value: `₹${statsData.totalRevenue.toLocaleString()}`, icon: "bi-cash", color: "info" },
    { title: "Staff Salary Expenses", value: `₹${statsData.staffSalaryExpenses.toLocaleString()}`, icon: "bi-wallet", color: "warning" },
    { title: "Govt Project Budgets", value: `₹${statsData.governmentProjectBudgets.toLocaleString()}`, icon: "bi-bank", color: "secondary" },
    { title: "Pending Payments", value: statsData.pendingPayments, icon: "bi-clock", color: "danger" }
  ];

  const COLORS = ['#007bff', '#28a745', '#17a2b8', '#ffc107', '#6c757d', '#dc3545'];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="row mb-4">
        <div className="col">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's an overview of your business performance.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-3">
            <div className={`stats-card bg-${stat.color} text-white h-100`}>
              <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
                <div className="d-flex justify-content-center align-items-center mb-2">
                  <i className={`bi ${stat.icon} fs-4`}></i>
                </div>
                <div>
                  <h3 className="card-value mb-1">{stat.value}</h3>
                  <p className="card-title mb-0 small opacity-75">{stat.title}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row mb-5">
        <div className="col-lg-8 mb-4">
          <div className="chart-card">
            <div className="card-header">
              <h5 className="mb-0">Monthly Revenue</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#007bff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="chart-card">
            <div className="card-header">
              <h5 className="mb-0">Service Request Trends</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#28a745" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="chart-card">
            <div className="card-header">
              <h5 className="mb-0">Revenue Breakdown</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Service Revenue', value: statsData.totalRevenue },
                      { name: 'Expenses', value: statsData.staffSalaryExpenses }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Service Revenue', value: statsData.totalRevenue },
                      { name: 'Expenses', value: statsData.staffSalaryExpenses }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="chart-card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-3">
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center justify-content-center gap-2 quick-action-btn"
                  onClick={() => navigate('/projects')}
                >
                  <i className="bi bi-eye"></i> View All Service Requests
                </button>
                <button
                  type="button"
                  className="btn btn-success d-flex align-items-center justify-content-center gap-2 quick-action-btn"
                  onClick={() => navigate('/staff-management')}
                >
                  <i className="bi bi-people"></i> Manage Staff
                </button>
                <button
                  type="button"
                  className="btn btn-info text-white d-flex align-items-center justify-content-center gap-2 quick-action-btn"
                  onClick={() => navigate('/government')}
                >
                  <i className="bi bi-bank"></i> Government Projects
                </button>
                <button
                  type="button"
                  className="btn btn-warning d-flex align-items-center justify-content-center gap-2 quick-action-btn"
                  onClick={() => navigate('/revenue-analytics')}
                >
                  <i className="bi bi-graph-up"></i> Revenue Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
