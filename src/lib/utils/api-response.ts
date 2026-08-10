import "server-only";
import { NextResponse } from "next/server";
import { ApiResponse } from "../types/api";
import { AppError } from "../errors/app-error";
import { logger } from "./logger";
import { ZodError } from "zod";

export function successResponse<T>(data: T, message?: string, status = 200) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  return NextResponse.json(body, { status });
}

export function errorResponse(message: string, status = 500, errors?: unknown) {
  const body: ApiResponse = {
    success: false,
    message,
    ...(errors ? { errors } : {}),
  };
  return NextResponse.json(body, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    if (!error.isOperational) {
      logger.error(`[AppError non-operational] ${error.message}`, error);
    }
    return errorResponse(error.message, error.statusCode, error.errors);
  }

  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return errorResponse("Validation error", 400, formattedErrors);
  }

  logger.error("Unhandled API Error", error);

  const isDev = process.env.NODE_ENV === "development";
  const errorMessage = isDev && error instanceof Error ? error.message : "Internal server error";

  return errorResponse(errorMessage, 500);
}
