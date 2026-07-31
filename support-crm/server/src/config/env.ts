import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV ?? "development",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  webauthnRpName: process.env.WEBAUTHN_RP_NAME ?? "Support CRM",
  webauthnRpId: process.env.WEBAUTHN_RP_ID ?? "localhost",
  webauthnOrigin: process.env.WEBAUTHN_ORIGIN ?? "http://localhost:5173",
};
