import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { requireAdmin, requireAuth } from "./middleware/auth";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { adminRouter } from "./routes/admin.routes";
import { authRouter } from "./routes/auth.routes";
import { statsRouter } from "./routes/stats.routes";
import { teamRouter } from "./routes/team.routes";
import { ticketRouter } from "./routes/ticket.routes";
import { userRouter } from "./routes/user.routes";
import { vendorRouter } from "./routes/vendor.routes";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);

app.use("/api/tickets", requireAuth, ticketRouter);
app.use("/api/stats", requireAuth, statsRouter);
app.use("/api/teams", requireAuth, teamRouter);
app.use("/api/users", requireAuth, userRouter);
app.use("/api/vendors", requireAuth, vendorRouter);
app.use("/api/admin", requireAuth, requireAdmin, adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);
