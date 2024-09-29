import { createCallerFactory, router } from "../trpc";
import { deviceRouter } from "./device";
import { userRouter } from "./user";

export const appRouter = router({
    device: deviceRouter,
    user: userRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
