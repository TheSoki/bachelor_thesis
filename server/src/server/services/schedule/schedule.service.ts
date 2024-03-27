import { serverEnv } from "@/env/server";
import { BaseService, type BaseServiceDependencies } from "../base/base.service";
import type { DeviceRepository } from "@/server/repositories/device/device.repository";
import puppeteer from "puppeteer";
import { parseString } from "xml2js";
import { z } from "zod";

export type ScheduleServiceDependencies = {
    deviceRepository: DeviceRepository;
} & BaseServiceDependencies;

interface ScheduleEvent {
    name: string;
    from: string;
    to: string;
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

export class ScheduleService extends BaseService {
    private deviceRepository: DeviceRepository;

    constructor(dependencies: ScheduleServiceDependencies) {
        super(dependencies);

        this.deviceRepository = dependencies.deviceRepository;
    }

    async getScheduleBuffer({ id, token }: { id: string; token: string }): Promise<Buffer | null> {
        try {
            const { buildingId, roomId, displayWidth, displayHeight } = await this.getDeviceById({
                id,
                token,
            });
            const roomName = `${buildingId}${roomId}`;
            const scheduleEvents = await this.getScheduleEvents({
                buildingId,
                roomId,
            });
            const scheduleHtml = this.generateScheduleHtml(roomName, displayWidth, displayHeight, scheduleEvents);
            const pngBuffer = await this.generatePngFromHtml(displayWidth, displayHeight, scheduleHtml);
            await this.deviceRepository.update(id, {
                lastSeen: new Date(),
            });

            return pngBuffer;
        } catch (e) {
            this.logger.error(`Error generating schedule image: ${e}`);

            return null;
        }
    }

    private async getDeviceById({ id, token }: { id: string; token: string }) {
        try {
            const device = await this.deviceRepository.getById({
                id,
                columns: {
                    buildingId: true,
                    roomId: true,
                    displayHeight: true,
                    displayWidth: true,
                    token: true,
                },
                include: {},
            });

            if (!device) {
                throw new Error(`No device with id '${id}'`);
            }

            if (device.token !== token) {
                throw new Error(`Invalid token for device with id '${id}'`);
            }

            return device;
        } catch (e) {
            this.logger.error(`Error fetching device with id '${id}': ${e}`);

            throw new Error(`No device with id '${id}'`);
        }
    }

    private async getScheduleEvents({
        buildingId,
        roomId,
    }: {
        buildingId: string;
        roomId: string;
    }): Promise<ScheduleEvent[]> {
        const response = await fetch(
            `https://demostag.osu.cz/ws/services/rest2/rozvrhy/getRozvrhByMistnost?budova=${buildingId}&mistnost=${roomId}`,
        );

        if (!response.ok) {
            this.logger.error(`Failed to fetch schedule events: ${response.statusText}`);
            return [];
        }

        const data = await response.text();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const xml: Record<string, any> = await new Promise((resolve, reject) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parseString(data, (err: any, result: unknown) => {
                if (err) {
                    reject(err);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve(result as any);
                }
            });
        });

        const scheduleEvents: ScheduleEvent[] = [];

        let now: Date, dayOfWeek: number;
        if (serverEnv.USE_MOCKED_SCHEDULE_DATE) {
            now = new Date("2023-10-02T08:00:00");
            dayOfWeek = 4;
        } else {
            now = new Date();
            dayOfWeek = now.getDay();
        }

        const day = CZECH_WEEK_DAYS[dayOfWeek];

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            xml?.["ns2:rozvrh"]["rozvrhovaAkce"].forEach((akce: any) => {
                const eventTimeSchema = z.object({
                    name: z.string(),
                    // hh:mm
                    fromTime: z.string().regex(/^\d{2}:\d{2}$/),
                    toTime: z.string().regex(/^\d{2}:\d{2}$/),
                    // dd.mm.yyyy or d.m.yyyy or d.mm.yyyy or dd.m.yyyy
                    startDate: z.string().regex(/^\d{1,2}\.\d{1,2}\.\d{4}$/),
                    endDate: z.string().regex(/^\d{1,2}\.\d{1,2}\.\d{4}$/),
                    dayOfWeek: z.string().regex(/^(Ne|Po|Út|St|Čt|Pá|So)$/),
                });

                const event = {
                    name: akce["nazev"][0],
                    fromTime: akce["hodinaSkutOd"][0],
                    toTime: akce["hodinaSkutDo"][0],
                    startDate: akce["datumOd"][0],
                    endDate: akce["datumDo"][0],
                    dayOfWeek: akce["denZkr"][0],
                };

                const parsedEvent = eventTimeSchema.safeParse(event);

                if (parsedEvent.success) {
                    const splitStart = event.startDate.split(".");
                    const validStartDate = new Date();
                    validStartDate.setDate(parseInt(splitStart[0]));
                    validStartDate.setMonth(parseInt(splitStart[1]) - 1);
                    validStartDate.setFullYear(parseInt(splitStart[2]));

                    const splitEnd = event.endDate.split(".");
                    const validEndDate = new Date();
                    validEndDate.setDate(parseInt(splitEnd[0]));
                    validEndDate.setMonth(parseInt(splitEnd[1]) - 1);
                    validEndDate.setFullYear(parseInt(splitEnd[2]));

                    const isTodayBetweenTimelines = now >= validStartDate && now <= validEndDate;
                    const isToday = day === event.dayOfWeek;

                    if (isTodayBetweenTimelines && isToday) {
                        scheduleEvents.push({
                            name: event.name,
                            from: event.fromTime,
                            to: event.toTime,
                        });
                    }
                } else {
                    this.logger.error(`Failed to parse event: ${JSON.stringify(event)}`);
                    this.logger.error(`Error: ${parsedEvent.error}`);
                }
            });
        } catch (e) {
            this.logger.error(`Error parsing schedule events: ${e}`);
        }

        return scheduleEvents;
    }

    private generateScheduleHtml(roomName: string, width: number, height: number, events: ScheduleEvent[]): string {
        const fontSize = 24 as const;
        const tableFontSize = 20 as const;
        const padding = 5 as const;
        const headerHeight = 40 as const;
        const infoCellWidth = 240 as const;

        const usableHeight = height - padding * 2;
        const usableWidth = width - padding * 2;

        const contentHeight = usableHeight - headerHeight;

        const cellHeight = contentHeight / LEARNING_HOURS.length;

        const eventsWithOffset = events.map((event) => {
            const startBlock = LEARNING_HOURS.findIndex((hour) => hour.from === event.from);
            const endBlock = LEARNING_HOURS.findIndex((hour) => hour.to === event.to) + 1;

            const offset = startBlock * cellHeight;
            const height = (endBlock - startBlock) * cellHeight;

            return {
                ...event,
                offset,
                height,
            };
        });

        const html = `
        <html>
        <head>
            <style>
                body {
                    padding: ${padding}px;
                    margin: 0;
                    background-color: #f0f0f0;
                    font-size: ${fontSize}px;
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
                .header {
                    border-bottom: 1px solid #000;
                    height: ${headerHeight}px;
                    font-weight: bold;
                    line-height: ${headerHeight}px;
                    display: flex;
                    justify-content: space-between;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <span>${roomName}</span>
                <span>Updated: ${new Date().toLocaleString("cs-CZ")}</span>
            </div>
            <div class="content">
                <table>
                    ${LEARNING_HOURS.map((hour, index) => `<tr><td>${index}</td><td>${hour.from} - ${hour.to}</td></tr>`).join("")}
                </table>
                <div style="width: 100%; height: ${contentHeight}px; position: relative;">
                    ${eventsWithOffset
                        .map(
                            (event) => `
                            <div style="position: absolute; top: ${event.offset}px; height: ${event.height}px; width: 100%; background-color: #D3D3D3; flex-direction: column; display: flex; justify-content: center; align-items: center;">
                                <div>${event.name}</div>
                                <div>${event.from} - ${event.to}</div>
                            </div>`,
                        )
                        .join("")}
                </div>
            </div>
        </body>
        </html>
    `;

        return html;
    }

    private async generatePngFromHtml(width: number, height: number, html: string): Promise<Buffer> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);

        await page.setViewport({ width, height });

        const pngBuffer = await page.screenshot({ type: "png" });

        await browser.close();

        return pngBuffer;
    }
}
