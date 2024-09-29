import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { Container, ContainerInstance } from "typedi";
import { LoggerRepository } from "./repositories/logger.repository";

export const createContext = async (opts: CreateNextContextOptions): Promise<Context> => {
    const session = await getServerSession(opts.req, opts.res, authOptions);

    const requestId = session?.user.id ? `user:${session.user.id}` : "anonymous";
    const container = Container.of(requestId);
    container.set(LoggerRepository, new LoggerRepository(requestId));

    return {
        session,
        container,
    };
};

export type Context = {
    session: Session | null;
    container: ContainerInstance;
};
