import "server-only";

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      ...(meta ? { meta } : {}),
    };
  }

  info(message: string, meta?: Record<string, unknown>) {
    console.log(JSON.stringify(this.formatMessage("info", message, meta)));
  }

  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(JSON.stringify(this.formatMessage("warn", message, meta)));
  }

  error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    const errDetails =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: process.env.NODE_ENV === "development" ? error.stack : undefined }
        : error;

    console.error(
      JSON.stringify(
        this.formatMessage("error", message, {
          error: errDetails,
          ...meta,
        })
      )
    );
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      console.debug(JSON.stringify(this.formatMessage("debug", message, meta)));
    }
  }
}

export const logger = new Logger();
