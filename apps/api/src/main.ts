import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { TenantInterceptor } from "./common/interceptors/tenant.interceptor";
import helmet from "helmet";

let cachedApp: INestApplication | null = null;

async function getApp(): Promise<INestApplication> {
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(helmet());

  app.enableCors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-ID", "X-Language"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor(), new TenantInterceptor());

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
  app.setGlobalPrefix("api", { exclude: ["health"] });

  const config = new DocumentBuilder()
    .setTitle("Hishab ERP API")
    .setDescription("Multi-tenant ERP for Bangladeshi SMEs")
    .setVersion("1.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT", in: "header" }, "access-token")
    .addApiKey({ type: "apiKey", name: "X-Tenant-ID", in: "header" }, "tenant-id")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.init();
  cachedApp = app;
  return app;
}

async function bootstrap() {
  const app = await getApp();
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Hishab API listening on port ${process.env.PORT ?? 3001}`);
}

/**
 * Vercel serverless entrypoint.
 * Delegates each request to the underlying Express instance of the
 * (cached) Nest application.
 */
export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  app.getHttpAdapter().getInstance()(req, res);
}

// Only start an HTTP listener when running outside Vercel (e.g. `node dist/main`).
if (!process.env.VERCEL) {
  void bootstrap();
}
