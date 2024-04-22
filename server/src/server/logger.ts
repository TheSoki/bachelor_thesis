import { createLogger, format, transports } from "winston";

export type { Logger } from "winston";

const { combine, timestamp, json, prettyPrint } = format;

export const initLogger = () => {
    const isProd = process.env.NODE_ENV === "production";

    const customFormat = isProd ? combine(timestamp(), json()) : combine(timestamp(), prettyPrint());

    const customTransports = isProd ? [new transports.File({ filename: "output.log" })] : [new transports.Console()];

    return createLogger({
        level: isProd ? "info" : "debug",
        format: customFormat,
        transports: customTransports,
    });
};
