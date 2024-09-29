import { format, createLogger, transports } from "winston";
import type { Logger } from "winston";

const { combine, timestamp, json, prettyPrint } = format;

export type LoggerType = Logger;

export class LoggerService {
    readonly logger: LoggerType;

    constructor(requestId: string | null) {
        const isProd = process.env.NODE_ENV === "production";

        const customFormat = isProd ? combine(timestamp(), json()) : combine(timestamp(), prettyPrint());

        const customTransports = isProd
            ? [new transports.File({ filename: "output.log" })]
            : [new transports.Console()];

        this.logger = createLogger({
            level: isProd ? "info" : "debug",
            format: customFormat,
            transports: customTransports,
        }).child({
            requestId,
        });
    }

    log<T extends Record<string | symbol | number, unknown>>(message: string, meta?: T) {
        this.logger.log({
            message,
            level: "log",
            ...meta,
        });
    }

    info<T extends Record<string | symbol | number, unknown>>(message: string, meta?: T) {
        this.logger.info({
            message,
            level: "info",
            ...meta,
        });
    }

    debug<T extends Record<string | symbol | number, unknown>>(message: string, meta?: T) {
        this.logger.debug({
            message,
            level: "debug",
            ...meta,
        });
    }

    error<T extends Record<string | symbol | number, unknown>>(message: string, meta?: T) {
        this.logger.error({
            message,
            level: "error",
            ...meta,
        });
    }

    warn<T extends Record<string | symbol | number, unknown>>(message: string, meta?: T) {
        this.logger.warn({
            message,
            level: "warn",
            ...meta,
        });
    }
}
