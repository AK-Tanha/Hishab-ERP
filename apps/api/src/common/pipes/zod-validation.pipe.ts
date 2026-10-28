import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { ZodSchema } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error: any) {
      if (error && typeof error === "object" && "errors" in error) {
        const zodError = error as { errors: { path: (string | number)[]; message: string }[] };
        throw new BadRequestException({
          statusCode: 400,
          message: "Validation failed",
          error: zodError.errors.map((e: any) => ({ path: e.path.join("."), message: e.message })),
          timestamp: new Date().toISOString(),
          path: "",
        });
      }
      throw new BadRequestException({
        statusCode: 400,
        message: "Validation failed",
        timestamp: new Date().toISOString(),
        path: "",
      });
    }
  }
}
