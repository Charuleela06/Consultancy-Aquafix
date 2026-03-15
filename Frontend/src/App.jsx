import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import StaffManagement from "./pages/StaffManagement";
import Projects from "./pages/Projects";
import ServiceRequest from "./pages/ServiceRequest";
import GovernmentProjects from "./pages/GovernmentProjects";
import GovernmentProjectDetails from "./pages/GovernmentProjectDetails";
import RevenueAnalytics from "./pages/RevenueAnalytics";
import Transactions from "./pages/Transactions";
import PaymentComplete from "./pages/PaymentComplete";
import MyRequests from "./pages/MyRequests";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <main className="flex-grow-1">
                  <Home />
                </main>
                <Footer />
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route
            path="/request"
            element={
              <ProtectedRoute requiredRole={["user", "staff"]}>
                <>
                  <Navbar />
                  <main className="flex-grow-1">
                    <ServiceRequest />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute requiredRole={["user", "staff"]}>
                <>
                  <Navbar />
                  <main className="flex-grow-1">
                    <MyRequests />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute requiredRole={["user", "staff"]}>
                <>
                  <Navbar />
                  <main className="flex-grow-1">
                    <Transactions />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-complete"
            element={
              <ProtectedRoute requiredRole={["user", "staff"]}>
                <>
                  <Navbar />
                  <main className="flex-grow-1">
                    <PaymentComplete />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes with Layout */}
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/staff-management" element={<ProtectedRoute requiredRole="admin"><AdminLayout><StaffManagement /></AdminLayout></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute requiredRole="admin"><AdminLayout><Projects /></AdminLayout></ProtectedRoute>} />
          <Route path="/government" element={<ProtectedRoute requiredRole="admin"><AdminLayout><GovernmentProjects /></AdminLayout></ProtectedRoute>} />
          <Route path="/government/:id" element={<ProtectedRoute requiredRole="admin"><AdminLayout><GovernmentProjectDetails /></AdminLayout></ProtectedRoute>} />
          <Route path="/revenue-analytics" element={<ProtectedRoute requiredRole="admin"><AdminLayout><RevenueAnalytics /></AdminLayout></ProtectedRoute>} />
        </Routes>
        <Toast />
      </div>
    </BrowserRouter>
  );
}

export default App;