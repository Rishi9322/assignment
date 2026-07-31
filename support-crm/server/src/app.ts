import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { requireAuth } from "./middleware/auth";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { adminRouter } from "./routes/admin.routes";
import { attachmentRouter } from "./routes/attachment.routes";
import { authRouter } from "./routes/auth.routes";
import { contactRouter } from "./routes/contact.routes";
import { notificationRouter } from "./routes/notification.routes";
import { permissionRouter } from "./routes/permission.routes";
import { settingsRouter } from "./routes/settings.routes";
import { requirePermission } from "./middleware/requirePermission";
import { statsRouter } from "./routes/stats.routes";
import { teamRouter } from "./routes/team.routes";
import { ticketRouter } from "./routes/ticket.routes";
import { slaRuleRouter } from "./routes/slaRule.routes";
import { userRouter } from "./routes/user.routes";
import { vendorRouter } from "./routes/vendor.routes";
import { webhookRouter } from "./routes/webhook.routes";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);

app.use("/api/tickets", requireAuth, ticketRouter);
app.use("/api/stats", requireAuth, statsRouter);
// Public: team names aren't sensitive and the Register page needs them unauthenticated.
app.use("/api/teams", teamRouter);
// Public: branding needs to render pre-login; PATCH is Admin-gated internally.
app.use("/api/settings", settingsRouter);
app.use("/api/users", requireAuth, userRouter);
app.use("/api/vendors", requireAuth, vendorRouter);
app.use("/api/contacts", requireAuth, contactRouter);
app.use("/api/attachments", requireAuth, attachmentRouter);
app.use("/api/notifications", requireAuth, notificationRouter);
// Sub-routes gate individually (some are Admin-only, some are permission-gated
// so an Admin can delegate them to Agents) — see admin.routes.ts.
app.use("/api/admin", requireAuth, adminRouter);
app.use("/api/admin/webhooks", requireAuth, requirePermission("manage_webhooks"), webhookRouter);
app.use("/api/admin/sla-rules", requireAuth, requirePermission("manage_sla"), slaRuleRouter);
app.use("/api/permissions", requireAuth, permissionRouter);

app.use(notFoundHandler);
app.use(errorHandler);
