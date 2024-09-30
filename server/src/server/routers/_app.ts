import { createCallerFactory, router } from "../trpc";
import { deviceRouter } from "./device";
import { userRouter } from "./user";
import { auditLogRouter } from "./audit-log";

export const appRouter = router({
    device: deviceRouter,
    user: userRouter,
    auditLog: auditLogRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
