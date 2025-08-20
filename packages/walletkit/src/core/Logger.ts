/**
 * Log levels enum for controlling logger verbosity
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4,
}

/**
 * Logger configuration interface
 */
export interface LoggerConfig {
    level: LogLevel;
    prefix?: string;
    enableTimestamp?: boolean;
    enableStackTrace?: boolean;
}

/**
 * Context object for structured logging
 */
export interface LogContext {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

/**
 * Logger class for TonWalletKit
 * Provides structured logging with configurable levels and context support
 */
export class Logger {
    private config: LoggerConfig;
    private static defaultConfig: LoggerConfig = {
        level: LogLevel.INFO,
        prefix: 'TonWalletKit',
        enableTimestamp: true,
        enableStackTrace: false,
    };

    constructor(config?: Partial<LoggerConfig>) {
        this.config = { ...Logger.defaultConfig, ...config };
    }

    /**
     * Update logger configuration
     */
    configure(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Log debug messages
     */
    debug(message: string, context?: LogContext): void {
        if (this.config.level <= LogLevel.DEBUG) {
            this.log('DEBUG', message, context);
        }
    }

    /**
     * Log info messages
     */
    info(message: string, context?: LogContext): void {
        if (this.config.level <= LogLevel.INFO) {
            this.log('INFO', message, context);
        }
    }

    /**
     * Log warning messages
     */
    warn(message: string, context?: LogContext): void {
        if (this.config.level <= LogLevel.WARN) {
            this.log('WARN', message, context);
        }
    }

    /**
     * Log error messages
     */
    error(message: string, context?: LogContext): void {
        if (this.config.level <= LogLevel.ERROR) {
            this.log('ERROR', message, context);
        }
    }

    /**
     * Internal logging method
     */
    private log(level: string, message: string, context?: LogContext): void {
        const timestamp = this.config.enableTimestamp ? new Date().toISOString() : '';
        const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';

        let logMessage = '';

        if (timestamp) {
            logMessage += `${timestamp} `;
        }

        if (prefix) {
            logMessage += `${prefix} `;
        }

        logMessage += `${level}: ${message}`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const logArgs: any[] = [logMessage];

        if (context && Object.keys(context).length > 0) {
            logArgs.push(context);
        }

        // Use appropriate console method based on level
        switch (level) {
            case 'DEBUG':
                // eslint-disable-next-line no-console
                console.debug(...logArgs);
                break;
            case 'INFO':
                // eslint-disable-next-line no-console
                console.info(...logArgs);
                break;
            case 'WARN':
                // eslint-disable-next-line no-console
                console.warn(...logArgs);
                break;
            case 'ERROR':
                // eslint-disable-next-line no-console
                console.error(...logArgs);
                if (this.config.enableStackTrace) {
                    // eslint-disable-next-line no-console
                    console.trace();
                }
                break;
        }
    }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Create a logger with custom configuration
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
    return new Logger(config);
}
