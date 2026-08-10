import "server-only";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../errors/app-error";

export async function validateRequestBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      const formattedErrors = err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      throw new ValidationError("Invalid request body", formattedErrors);
    }
    if (err instanceof SyntaxError) {
      throw new ValidationError("Invalid JSON input");
    }
    throw err;
  }
}

export function validateQueryParams<T>(url: string, schema: ZodSchema<T>): T {
  const { searchParams } = new URL(url);
  const paramsObj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    paramsObj[key] = value;
  });

  try {
    return schema.parse(paramsObj);
  } catch (err) {
    if (err instanceof ZodError) {
      const formattedErrors = err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      throw new ValidationError("Invalid query parameters", formattedErrors);
    }
    throw err;
  }
}

export function validateParams<T>(params: unknown, schema: ZodSchema<T>): T {
  try {
    return schema.parse(params);
  } catch (err) {
    if (err instanceof ZodError) {
      const formattedErrors = err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      throw new ValidationError("Invalid route parameters", formattedErrors);
    }
    throw err;
  }
}
