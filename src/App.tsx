import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import RealnameAuth from '@/pages/RealnameAuth'
import Certificates from '@/pages/Certificates'
import Services from '@/pages/Services'
import ServiceDetail from '@/pages/ServiceDetail'
import Applications from '@/pages/Applications'
import ApplicationDetail from '@/pages/ApplicationDetail'
import Appointment from '@/pages/Appointment'
import Queue from '@/pages/Queue'
import ELicenses from '@/pages/ELicenses'
import Evaluation from '@/pages/Evaluation'
import Dashboard from '@/pages/admin/Dashboard'
import Reports from '@/pages/admin/Reports'
import ApprovalWorkbench from '@/pages/admin/ApprovalWorkbench'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/auth/realname" element={<RealnameAuth />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/appointment/queue" element={<Queue />} />
          <Route path="/e-licenses" element={<ELicenses />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/approval" element={<ApprovalWorkbench />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  )
}
