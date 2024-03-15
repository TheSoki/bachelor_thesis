import { createCallerFactory, publicProcedure, router } from "../trpc";

export const appRouter = router({
    healthcheck: publicProcedure.query(() => "up!"),
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
