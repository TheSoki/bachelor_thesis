import { createCallerFactory, publicProcedure, router } from "../trpc";
import { deviceRouter } from "./device";
import { userRouter } from "./user";

export const appRouter = router({
    healthcheck: publicProcedure.query(() => "up!"),

    device: deviceRouter,
    user: userRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
