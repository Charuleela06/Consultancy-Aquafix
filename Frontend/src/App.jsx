import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import StaffManagement from "./pages/StaffManagement";
import Projects from "./pages/Projects";
import ServiceRequest from "./pages/ServiceRequest";
import GovernmentProjects from "./pages/GovernmentProjects";
import Transactions from "./pages/Transactions";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<ProtectedRoute requiredRole="user"><Home /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="admin"><Dashboard /></ProtectedRoute>} />
            <Route path="/staff-management" element={<ProtectedRoute requiredRole="admin"><StaffManagement /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute requiredRole="admin"><Projects /></ProtectedRoute>} />
            <Route path="/request" element={<ProtectedRoute requiredRole="user"><ServiceRequest /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute requiredRole="user"><Transactions /></ProtectedRoute>} />
            <Route path="/government" element={<ProtectedRoute requiredRole="admin"><GovernmentProjects /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;