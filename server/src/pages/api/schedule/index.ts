import { createInnerContext } from "@/server/context";
import { scheduleSchema } from "@/server/schema/schedule";
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
        console.log(parsedData.error);
        res.status(400).end();
        return;
    }

    let innerCtx = globalThis.innerCtx;

    if (!innerCtx || process.env.NODE_ENV === "development") {
        innerCtx = createInnerContext();
        globalThis.innerCtx = innerCtx;
    }

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const pngBuffer = await innerCtx.scheduleService.getScheduleBuffer(parsedData.data);

    if (!pngBuffer) {
        res.status(400).end();
        return;
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", pngBuffer.length.toString());

    res.send(pngBuffer);
}
