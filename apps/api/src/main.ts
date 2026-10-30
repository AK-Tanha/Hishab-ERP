import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { TenantInterceptor } from "./common/interceptors/tenant.interceptor";

export function configureApp(app: INestApplication) {
  app.use(helmet());

  // Only your own frontends may call the API with credentials
  const origins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins, // e.g. "http://localhost:3000,https://hishab.vercel.app"
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-ID", "X-Language"],
    credentials: true,
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
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TenantInterceptor(),
  );

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
  app.setGlobalPrefix("api", { exclude: ["health"] });

  // Swagger only when explicitly enabled (off in production by default)
  if (process.env.ENABLE_SWAGGER === "true") {
    const config = new DocumentBuilder()
      .setTitle("Hishab ERP API")
      .setDescription("Multi-tenant ERP for Bangladeshi SMEs")
      .setVersion("1.0")
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT", in: "header" },
        "access-token",
      )
      .addApiKey({ type: "apiKey", name: "X-Tenant-ID", in: "header" }, "tenant-id")
      .build();
    SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, config));
  }
}