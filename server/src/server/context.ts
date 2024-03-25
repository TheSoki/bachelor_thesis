import { db } from "@/db/connection";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth/next";
import { UserRepository } from "./repositories/user/user.repository";
import { DeviceRepository } from "./repositories/device/device.repository";
import { UserService } from "./services/user/user.service";
import { DeviceService } from "./services/device/device.service";
import type { Session } from "next-auth";
import { initLogger, type Logger } from "./logger";

const globalContext = globalThis as unknown as {
    innerCtx: InnerContext | undefined;
};

export const createInnerContext = (): InnerContext => {
    const logger = initLogger();

    const userRepository = new UserRepository({ db, logger });
    const deviceRepository = new DeviceRepository({ db, logger });

    const userService = new UserService({ logger, userRepository, deviceRepository });
    const deviceService = new DeviceService({ logger, deviceRepository });

    return { logger, userService, deviceService };
};

export type InnerContext = {
    logger: Logger;
    userService: UserService;
    deviceService: DeviceService;
};

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export const createContext = async (opts: CreateNextContextOptions): Promise<Context> => {
    let innerCtx = globalContext.innerCtx;

    if (!innerCtx) {
        innerCtx = createInnerContext();
        globalContext.innerCtx = innerCtx;
    }

    const { logger, userService, deviceService } = innerCtx;
    const session = await getServerSession(opts.req, opts.res, authOptions);

    return {
        logger,
        session,
        userService,
        deviceService,
    };
};

export type Context = {
    logger: Logger;
    session: Session | null;
    userService: UserService;
    deviceService: DeviceService;
};
