import { db } from "@/db/connection";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth/next";
import { UserRepository } from "./repositories/user/user.repository";
import { DeviceRepository } from "./repositories/device/device.repository";
import { UserService } from "./services/user/user.service";
import { DeviceService } from "./services/device/device.service";
import type { Session } from "next-auth";

const globalContext = globalThis as unknown as {
    innerCtx: InnerContext | undefined;
};

export const createInnerContext = (): InnerContext => {
    const userRepository = new UserRepository({ db });
    const deviceRepository = new DeviceRepository({ db });

    const userService = new UserService({ userRepository, deviceRepository });
    const deviceService = new DeviceService({ deviceRepository });

    return {
        userService,
        deviceService,
    };
};

export type InnerContext = {
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

    const { userService, deviceService } = innerCtx;
    const session = await getServerSession(opts.req, opts.res, authOptions);

    // console.log("createContext for", session?.user?.name ?? "unknown user");

    return {
        session,
        userService,
        deviceService,
    };
};

export type Context = {
    session: Session | null;
    userService: UserService;
    deviceService: DeviceService;
};
