import { createInnerContext } from "@/server/context";
import { scheduleSchema } from "@/server/schema/schedule";
import { LoggerService } from "@/server/services/logger.service";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<Buffer>) {
    if (req.method !== "GET") {
        res.status(405).end();
        return;
    }

    const headers = {
        id: req.headers["x-device-id"],
        token: req.headers["x-device-secret"],
        displayHeight: Number(req.headers["x-display-height"]),
        displayWidth: Number(req.headers["x-display-width"]),
    };

    const parsedData = await scheduleSchema.safeParseAsync(headers);

    if (!parsedData.success) {
        res.status(400).end();
        return;
    }

    const requestId = `device:${parsedData.data.id}`;
    const loggerService = new LoggerService(requestId);

    const ctx = createInnerContext(loggerService);

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const pngBuffer = await ctx.scheduleService.getScheduleBuffer(parsedData.data);

    if (!pngBuffer) {
        res.status(400).end();
        return;
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", pngBuffer.length.toString());

    res.send(pngBuffer);
}
