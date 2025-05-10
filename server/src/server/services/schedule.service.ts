import { serverEnv } from "@/env/server";
import puppeteer from "puppeteer";
import { z } from "zod";
import { Service } from "typedi";
import { LoggerRepository } from "../repositories/logger.repository";
import { DeviceRepository } from "../repositories/device.repository";
import { format, parse, isWithinInterval, getDay } from "date-fns";
import { cs } from "date-fns/locale";

interface ScheduleEvent {
    name: string;
    type: string;
    fromTime: string;
    toTime: string;
    teacher: string;
}

const LEARNING_HOURS = [
    { from: "06:30", to: "07:15" },
    { from: "07:30", to: "08:15" },
    { from: "08:20", to: "09:05" },
    { from: "09:10", to: "09:55" },
    { from: "10:00", to: "10:45" },
    { from: "10:50", to: "11:35" },
    { from: "11:40", to: "12:25" },
    { from: "12:30", to: "13:15" },
    { from: "13:20", to: "14:05" },
    { from: "14:10", to: "14:55" },
    { from: "15:00", to: "15:45" },
    { from: "15:50", to: "16:35" },
    { from: "16:40", to: "17:25" },
    { from: "17:30", to: "18:15" },
    { from: "18:20", to: "19:05" },
    { from: "19:10", to: "19:55" },
    { from: "20:00", to: "20:45" },
] as const;

const CZECH_WEEK_DAYS = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"] as const;

const eventSchema = z.object({
    name: z.string(),
    type: z.string(),
    teacher: z.string(),
    fromTime: z.string().regex(/^\d{2}:\d{2}$/),
    toTime: z.string().regex(/^\d{2}:\d{2}$/),
    startDate: z.string().regex(/^\d{1,2}\.\d{1,2}\.\d{4}$/),
    endDate: z.string().regex(/^\d{1,2}\.\d{1,2}\.\d{4}$/),
    dayOfWeek: z.enum(CZECH_WEEK_DAYS),
});

@Service()
export class ScheduleService {
    constructor(
        private readonly logger: LoggerRepository,
        private readonly deviceRepository: DeviceRepository,
    ) {}

    async getScheduleBuffer({
        id,
        token,
        displayHeight,
        displayWidth,
    }: {
        id: string;
        token: string;
        displayHeight: number;
        displayWidth: number;
    }): Promise<Buffer | null> {
        try {
            const { buildingId, roomId } = await this.getDeviceById({ id, token });
            const roomName = `${buildingId}${roomId}`;
            const scheduleEvents = await this.getScheduleEvents({ buildingId, roomId });
            const scheduleHtml = this.generateScheduleHtml(roomName, displayWidth, displayHeight, scheduleEvents);
            const pngBuffer = await this.generatePngFromHtml(displayWidth, displayHeight, scheduleHtml);

            await this.deviceRepository.update({
                where: { id },
                data: { lastSeen: new Date() },
            });

            return pngBuffer;
        } catch (e) {
            this.logger.error(`Error generating schedule image: ${e}`);
            return null;
        }
    }

    private async getDeviceById({ id, token }: { id: string; token: string }) {
        const device = await this.deviceRepository.findFirst({
            where: { id },
            select: { buildingId: true, roomId: true, token: true },
        });

        if (!device || device.token !== token) {
            throw new Error(`Invalid device id or token: ${id}`);
        }

        return device;
    }

    private async getScheduleEvents({
        buildingId,
        roomId,
    }: {
        buildingId: string;
        roomId: string;
    }): Promise<ScheduleEvent[]> {
        const response = await fetch(
            `${serverEnv.STAG_SCHEDULE_EVENTS_API_URL}?budova=${buildingId}&mistnost=${roomId}`,
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Basic ${serverEnv.STAG_SCHEDULE_EVENTS_API_AUTHORIZATION_HEADER_TOKEN}`,
                },
            },
        );

        if (!response.ok) {
            this.logger.error(`Failed to fetch schedule events: ${response.statusText}`);
            return [];
        }

        const data = await response.json();

        const now = new Date();

        const day = CZECH_WEEK_DAYS[getDay(now)] ?? "Ne";

        const actions = data?.rozvrhovaAkce || [];

        if (actions.length === 0) {
            this.logger.error(`No schedule events found`);
            return [];
        }

        return (
            actions
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((akce: any) => {
                    if (!akce) {
                        return null;
                    }

                    const teacher = akce.ucitel
                        ? `${akce.ucitel.titulPred ?? ""} ${akce.ucitel.jmeno ?? ""} ${akce.ucitel.prijmeni ?? ""} ${akce.ucitel.titulZa ?? ""}`.trim()
                        : "N/A";

                    const event = {
                        name: akce.nazev,
                        type: akce.typAkce,
                        fromTime: akce.hodinaSkutOd?.value,
                        toTime: akce.hodinaSkutDo?.value,
                        startDate: akce.datumOd?.value,
                        endDate: akce.datumDo?.value,
                        dayOfWeek: akce.denZkr,
                        teacher,
                    };

                    const parsedEvent = eventSchema.safeParse(event);

                    if (!parsedEvent.success) {
                        this.logger.error(`Failed to parse event: ${JSON.stringify(event)}`);
                        this.logger.error(`Error: ${parsedEvent.error}`);
                        return null;
                    }

                    return parsedEvent.data;
                })
                .filter((event: z.infer<typeof eventSchema> | null) => event && this.isEventToday(event, now, day))
        );
    }

    private isEventToday(event: z.infer<typeof eventSchema>, now: Date, day: string): boolean {
        const parseDate = (dateStr: string) => parse(dateStr, "d.M.yyyy", new Date());
        const startDate = parseDate(event.startDate);
        const endDate = parseDate(event.endDate);

        return isWithinInterval(now, { start: startDate, end: endDate }) && day === event.dayOfWeek;
    }

    private generateScheduleHtml(roomName: string, width: number, height: number, events: ScheduleEvent[]): string {
        const fontSize = 24;
        const tableFontSize = 20;
        const padding = 5;
        const headerHeight = 40;
        const infoCellWidth = 240;

        const usableHeight = height - padding * 2;
        const usableWidth = width - padding * 2;
        const contentHeight = usableHeight - headerHeight;
        const cellHeight = contentHeight / LEARNING_HOURS.length;

        const eventsWithOffset = events.map((event) => {
            const startBlock = LEARNING_HOURS.findIndex((hour) => hour.from === event.fromTime);
            const endBlock = LEARNING_HOURS.findIndex((hour) => hour.to === event.toTime) + 1;
            return {
                ...event,
                offset: startBlock * cellHeight,
                height: (endBlock - startBlock) * cellHeight,
            };
        });

        return `
        <html>
        <head>
            <style>
                body {
                    padding: ${padding}px;
                    margin: 0;
                    background-color: #f0f0f0;
                    font-size: ${fontSize}px;
                    font-family: Arial, sans-serif;
                }
                .content {
                    width: ${usableWidth}px;
                    height: ${contentHeight}px;
                    display: flex;
                }
                table {
                    border: none;
                    table-layout: fixed;
                    border-collapse: collapse;
                    font-size: ${tableFontSize}px;
                }
                td {
                    text-align: center;
                    width: ${infoCellWidth}px;
                    height: ${cellHeight}px;
                    position: relative;
                }
                tr {
                    border-bottom: 1px solid #000;
                }
                .header {
                    border-bottom: 1px solid #000;
                    box-sizing: border-box;
                    height: ${headerHeight}px;
                    font-weight: bold;
                    line-height: ${headerHeight}px;
                    display: flex;
                    justify-content: space-between;
                }
                .event {
                    position: absolute;
                    width: 100%;
                    background-color: #D3D3D3;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    border-bottom: 1px solid #000;
                    box-sizing: border-box;
                    padding: 5px;
                    overflow: hidden;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <span>${roomName}</span>
                <span>Updated: ${format(new Date(), "Pp", { locale: cs })}</span>
            </div>
            <div class="content">
                <table>
                    ${LEARNING_HOURS.map(
                        (hour, index) => `
                        <tr><td>${index}</td><td>${hour.from} - ${hour.to}</td></tr>
                    `,
                    ).join("")}
                </table>
                <div style="width: 100%; height: ${contentHeight}px; position: relative;">
                    ${eventsWithOffset
                        .map(
                            (event, index) => `
                        <div class="event" style="top: ${event.offset}px; height: ${event.height}px; border-top: ${index === 0 ? "1px solid #000" : "none"};">
                            <div>${event.name}, ${event.type} (${event.fromTime} - ${event.toTime})</div>
                            <div>${event.teacher}</div>
                        </div>
                    `,
                        )
                        .join("")}
                </div>
            </div>
        </body>
        </html>
    `;
    }

    private async generatePngFromHtml(width: number, height: number, html: string): Promise<Buffer> {
        const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
        const page = await browser.newPage();
        await page.setContent(html);
        await page.setViewport({ width, height });
        const pngBuffer = await page.screenshot({ type: "png" });
        await browser.close();
        const buffer = Buffer.from(pngBuffer);
        return buffer;
    }
}
