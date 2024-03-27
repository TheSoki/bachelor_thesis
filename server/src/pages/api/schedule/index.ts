import { createInnerContext } from "@/server/context";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<Buffer>) {
    if (req.method !== "GET") {
        res.status(405).end();
        return;
    }

    const deviceId = req.headers["x-device-id"] as string | undefined;
    const secret = req.headers["x-device-secret"] as string | undefined;

    if (!deviceId || !secret) {
        res.status(400).end();
        return;
    }

    let innerCtx = globalThis.innerCtx;

    if (!innerCtx || process.env.NODE_ENV === "development") {
        innerCtx = createInnerContext();
        globalThis.innerCtx = innerCtx;
    }

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const pngBuffer = await innerCtx.scheduleService.getScheduleBuffer({
        id: deviceId,
        token: secret,
    });

    if (!pngBuffer) {
        res.status(400).end();
        return;
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", pngBuffer.length.toString());

    res.send(pngBuffer);
}
