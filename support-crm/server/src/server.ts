import { app } from "./app";
import { env } from "./config/env";
import { dbReady } from "./config/prisma";

dbReady.then(() => {
  app.listen(env.port, () => {
    console.log(`Support CRM API listening on http://localhost:${env.port}`);
  });
});
