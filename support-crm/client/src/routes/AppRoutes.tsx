import { Route, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Landing } from "../pages/Landing";
import { Dashboard } from "../pages/Dashboard";
import { CreateTicket } from "../pages/CreateTicket";
import { TicketDetails } from "../pages/TicketDetails";
import { Vendors } from "../pages/Vendors";
import { Security } from "../pages/Security";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { AdminUsers } from "../pages/admin/Users";
import { AdminAuditLog } from "../pages/admin/AuditLog";
import { AdminTeams } from "../pages/admin/Teams";
import { NotFound } from "../pages/NotFound";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AdminRoute } from "../components/AdminRoute";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/tickets/:ticketId" element={<TicketDetails />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/security" element={<Security />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/teams" element={<AdminTeams />} />
          <Route path="/admin/audit-log" element={<AdminAuditLog />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>
  </Routes>
);
