import type { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./openapi";

export function setupSwagger(app: Express): void {
  app.get("/api/docs.json", (_req: Request, res: Response) => {
    res.set("Cache-Control", "no-store");
    res.json(openapiSpec);
  });

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
      customSiteTitle: "Lokkho API Docs",
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: "none",
        filter: true,
        tryItOutEnabled: true,
        displayRequestDuration: true,
      },
    }),
  );
}

export default setupSwagger;
