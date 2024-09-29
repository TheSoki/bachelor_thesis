import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth/next";
import { UserRepository } from "./repositories/user/user.repository";
import { DeviceRepository } from "./repositories/device/device.repository";
import { UserService } from "./services/user.service";
import { DeviceService } from "./services/device.service";
import type { Session } from "next-auth";
import { ScheduleService } from "./services/schedule.service";
import { LoggerService } from "./services/logger.service";

export const createInnerContext = (logger: LoggerService): InnerContext => {
    const userRepository = new UserRepository();
    const deviceRepository = new DeviceRepository();

    const userService = new UserService({ logger, userRepository });
    const deviceService = new DeviceService({ logger, deviceRepository });
    const scheduleService = new ScheduleService({ logger, deviceRepository });

    return { userService, deviceService, scheduleService };
};

export type InnerContext = {
    userService: UserService;
    deviceService: DeviceService;
    scheduleService: ScheduleService;
};

export const createContext = async (opts: CreateNextContextOptions): Promise<Context> => {
    const session = await getServerSession(opts.req, opts.res, authOptions);

    const sessionId = session?.user.id ? `user:${session.user.id}` : "anonymous";
    const loggerService = new LoggerService(sessionId);

    const ctx = createInnerContext(loggerService);

    const { userService, deviceService, scheduleService } = ctx;

    return {
        logger: loggerService,
        userService,
        deviceService,
        scheduleService,
        session,
    };
};

export type Context = InnerContext & {
    logger: LoggerService;
    session: Session | null;
};
