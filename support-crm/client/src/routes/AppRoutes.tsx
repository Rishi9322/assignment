import { Route, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Landing } from "../pages/Landing";
import { VoiceTicketPage } from "../pages/VoiceTicketPage";
import { Dashboard } from "../pages/Dashboard";
import { CreateTicket } from "../pages/CreateTicket";
import { TicketDetails } from "../pages/TicketDetails";
import { Vendors } from "../pages/Vendors";
import { Contacts } from "../pages/Contacts";
import { ContactDetail } from "../pages/ContactDetail";
import { Security } from "../pages/Security";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { AdminUsers } from "../pages/admin/Users";
import { AdminAuditLog } from "../pages/admin/AuditLog";
import { AdminTeams } from "../pages/admin/Teams";
import { AdminWebhooks } from "../pages/admin/Webhooks";
import { AdminSlaRules } from "../pages/admin/SlaRules";
import { AdminPermissions } from "../pages/admin/Permissions";
import { AdminSettings } from "../pages/admin/Settings";
import { NotFound } from "../pages/NotFound";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AdminRoute } from "../components/AdminRoute";
import { PermissionRoute } from "../components/PermissionRoute";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/voice-ticket" element={<VoiceTicketPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/tickets/:ticketId" element={<TicketDetails />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/contacts/:contactId" element={<ContactDetail />} />
        <Route path="/security" element={<Security />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/permissions" element={<AdminPermissions />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        <Route element={<PermissionRoute permission="manage_teams" />}>
          <Route path="/admin/teams" element={<AdminTeams />} />
        </Route>
        <Route element={<PermissionRoute permission="manage_webhooks" />}>
          <Route path="/admin/webhooks" element={<AdminWebhooks />} />
        </Route>
        <Route element={<PermissionRoute permission="manage_sla" />}>
          <Route path="/admin/sla-rules" element={<AdminSlaRules />} />
        </Route>
        <Route element={<PermissionRoute permission="view_audit_log" />}>
          <Route path="/admin/audit-log" element={<AdminAuditLog />} />
        </Route>
      </Route>
    </Route>

    {/* Public fallback: an unmatched path always shows 404, never a login
        redirect. This route is deliberately outside ProtectedRoute — it's
        never more specific than a real page path, so authenticated users on
        a real route are unaffected. */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);
