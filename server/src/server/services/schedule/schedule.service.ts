import { BaseService, type BaseServiceDependencies } from "../base/base.service";
import type { DeviceRepository } from "@/server/repositories/device/device.repository";
import puppeteer from "puppeteer";

export type ScheduleServiceDependencies = {
    deviceRepository: DeviceRepository;
} & BaseServiceDependencies;

interface ScheduleEvent {
    name: string;
    from: string;
    to: string;
}

export class ScheduleService extends BaseService {
    private deviceRepository: DeviceRepository;

    constructor(dependencies: ScheduleServiceDependencies) {
        super(dependencies);

        this.deviceRepository = dependencies.deviceRepository;
    }

    async getImage(id: string): Promise<Buffer | null> {
        try {
            const { buildingId, roomId, displayWidth, displayHeight } = await this.getDeviceById(id);
            const roomName = `${buildingId}${roomId}`;
            const scheduleEvents = await this.getScheduleEvents();
            const scheduleHtml = this.generateScheduleHtml(roomName, displayWidth, displayHeight, scheduleEvents);
            const pngBuffer = await this.generatePngFromHtml(displayWidth, displayHeight, scheduleHtml);

            return pngBuffer;
        } catch (e) {
            this.logger.error(`Error generating schedule image: ${e}`);

            return null;
        }
    }

    private async getDeviceById(id: string) {
        try {
            const device = await this.deviceRepository.getById({
                id,
                columns: {
                    buildingId: true,
                    roomId: true,
                    displayHeight: true,
                    displayWidth: true,
                },
                include: {},
            });

            if (!device) {
                throw new Error(`No device with id '${id}'`);
            }

            return device;
        } catch (e) {
            this.logger.error(`Error fetching device with id '${id}': ${e}`);

            throw new Error(`No device with id '${id}'`);
        }
    }

    private async getScheduleEvents(): Promise<ScheduleEvent[]> {
        const scheduleEvents: ScheduleEvent[] = [
            { name: "Meeting", from: "08:00", to: "10:00" },
            { name: "Lunch", from: "12:00", to: "13:00" },
            { name: "Presentation", from: "14:00", to: "16:00" },
            { name: "Meeting 1", from: "16:00", to: "18:00" },
            { name: "Meeting 2", from: "15:00", to: "18:00" },
        ];

        return scheduleEvents;
    }

    private generateScheduleHtml(roomName: string, width: number, height: number, events: ScheduleEvent[]): string {
        const learningHours = [
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
        ];

        const paddingX = 10;
        const cellWidth = (width - paddingX * 2) / learningHours.length;
        const cellHeight = 45;

        let html = `
        <html>
            <head>
                <style>
                    body {
                        padding: 0;
                        padding-left: ${paddingX}px;
                        padding-right: ${paddingX}px;
                        margin: 0;
                        background-color: #f0f0f0;
                    }
                    .schedule {
                        max-width: ${width}px;
                        max-height: ${height}px;
                        border: none;
                        table-layout: fixed;
                        border-collapse: collapse;
                    }
                    .schedule td {
                        border: 1px solid black;
                        text-align: center;
                        width: ${cellWidth}px;
                        height: ${cellHeight}px;
                        position: relative;
                    }
                    .header {
                        height: ${cellHeight}px;
                        font-weight: bold;
                        line-height: ${cellHeight}px;
                        display: flex;
                        justify-content: space-between;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                <span>${roomName}</span>
                    <span>Last updated: ${new Date().toLocaleTimeString("cs-CZ")}</span>
                </div>
                <table class="schedule">
                    <tr>
                        ${learningHours.map((_, index) => `<td>${index}</td>`).join("")}
                    </tr>
                    <tr>
                        ${learningHours.map((hour) => `<td><div>${hour.from}</div><div>${hour.to}</div></td>`).join("")}
                    </tr>
                </table>
                
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
