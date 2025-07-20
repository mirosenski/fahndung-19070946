type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isProduction = process.env.NODE_ENV === "production";

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      formatted += ` | Error: ${error.message}`;
      if (this.isDevelopment) {
        formatted += ` | Stack: ${error.stack}`;
      }
    }
    
    return formatted;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case "debug":
        if (this.isDevelopment) {
          console.debug(formattedMessage);
        }
        break;
      case "info":
        console.info(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "error":
        console.error(formattedMessage);
        
        // In Produktion könnten wir hier Error-Tracking-Services aufrufen
        if (this.isProduction) {
          // Sentry.captureException(error || new Error(message), { extra: context });
        }
        break;
    }

    // Hier könnte man auch zu einem externen Logging-Service senden
    // await this.sendToLoggingService(entry);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log("warn", message, context, error);
  }

  error(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log("error", message, context, error);
  }

  // Spezielle Logger für verschiedene Bereiche
  auth(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log("info", `[AUTH] ${message}`, context, error);
  }

  api(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log("info", `[API] ${message}`, context, error);
  }

  database(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log("info", `[DB] ${message}`, context, error);
  }

  security(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log("warn", `[SECURITY] ${message}`, context, error);
  }
}

// Singleton-Instanz
export const logger = new Logger();

// Convenience-Funktionen
export const logAuth = (message: string, context?: Record<string, unknown>, error?: Error) => 
  logger.auth(message, context, error);

export const logApi = (message: string, context?: Record<string, unknown>, error?: Error) => 
  logger.api(message, context, error);

export const logDatabase = (message: string, context?: Record<string, unknown>, error?: Error) => 
  logger.database(message, context, error);

export const logSecurity = (message: string, context?: Record<string, unknown>, error?: Error) => 
  logger.security(message, context, error); 