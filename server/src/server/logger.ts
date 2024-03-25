import { createLogger, format, transports } from "winston";

export type { Logger } from "winston";

export const initLogger = () => {
    const isProd = process.env.NODE_ENV === "production";

    const logger = createLogger({
        level: "info",
        format: format.json(),
        transports: isProd
            ? [
                  //
                  // - Write all logs with importance level of `error` or less to `error.log`
                  // - Write all logs with importance level of `info` or less to `combined.log`
                  //
                  new transports.File({ filename: "error.log", level: "error" }),
                  new transports.File({ filename: "combined.log" }),
              ]
            : [
                  new transports.Console({
                      format: format.cli(),
                  }),
              ],
    });

    return logger;
};
