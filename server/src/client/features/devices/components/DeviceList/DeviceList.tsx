import { FullscreenError } from "@/client/components/FullscreenError";
import { trpc } from "@/utils/trpc";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/client/shadcn/ui/table";
import { Skeleton } from "@/client/shadcn/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationLink,
    PaginationNext,
} from "@/client/shadcn/ui/pagination";
import { useCallback } from "react";
import clsx from "clsx";
import { match, P } from "ts-pattern";
import { Button } from "@/client/shadcn/ui/button";
import { useDeviceCreateModalStore } from "../../hooks/useDeviceCreateModalStore";
import { useDeviceDeleteModalStore } from "../../hooks/useDeviceDeleteModalStore";
import { useDeviceUpdateModalStore } from "../../hooks/useDeviceUpdateModalStore";

type DeviceListProps = {
    page: number;
    nextPageHref: string;
    prevPageHref: string;
};

export const DeviceList = ({ page, nextPageHref, prevPageHref }: DeviceListProps) => {
    const utils = trpc.useUtils();
    const deviceQuery = trpc.device.list.useQuery({ page });
    const setDeviceIdToDelete = useDeviceDeleteModalStore((state) => state.setDeviceId);
    const setDeviceIdToUpdate = useDeviceUpdateModalStore((state) => state.setDeviceId);
    const openCreateDeviceModal = useDeviceCreateModalStore((state) => state.setIsOpen);

    const onCopyTokenClick = useCallback(
        async (id: string) => {
            try {
                const data = await utils.device.getDeviceToken.fetch({
                    id,
                });

                navigator.clipboard.writeText(data.token);
            } catch (error) {
                console.error({ error }, "Failed to copy token");
            }
        },
        [utils.device.getDeviceToken],
    );

    if (deviceQuery.error) {
        return (
            <FullscreenError title={deviceQuery.error.message} statusCode={deviceQuery.error.data?.httpStatus ?? 500} />
        );
    }

    if (deviceQuery.status === "pending") {
        return (
            <>
                {[...Array(10)].map((_, i) => (
                    <Skeleton className="mb-2 h-10" key={`device-table-skeleton-${i}`} />
                ))}
            </>
        );
    }

    const { list, totalPages, totalCount } = deviceQuery.data;

    return (
        <div className="py-8">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-3xl font-semibold">Devices</h2>
                <Button variant="secondary" onClick={() => openCreateDeviceModal(true)}>
                    Create Device
                </Button>
            </div>

            <Table>
                <TableCaption>
                    {match(totalCount)
                        .with(
                            P.when((totalCount) => totalCount === 0),
                            () => "No devices",
                        )
                        .with(
                            P.when((totalCount) => totalCount === 1),
                            () => "One device",
                        )
                        .otherwise(() => `${totalCount} devices`)}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Room</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="w-[150px] text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {list.map((device) => (
                        <TableRow key={device.id}>
                            <TableCell className="font-medium">{`${device.buildingId}${device.roomId}`}</TableCell>
                            <TableCell>
                                {device.lastSeen ? new Date(device.lastSeen).toLocaleString("cs-CZ") : <i>Never</i>}
                            </TableCell>
                            <TableCell>
                                <Button onClick={() => onCopyTokenClick(device.id)} variant="ghost" size="sm">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                                        />
                                    </svg>
                                    <span className="ml-1">Copy</span>
                                </Button>
                            </TableCell>
                            <TableCell>{device.author?.name ?? <i>Deleted</i>}</TableCell>
                            <TableCell>{device.createdAt.toLocaleString("cs-CZ")}</TableCell>
                            <TableCell className="flex items-center justify-end space-x-2">
                                <Button variant="secondary" onClick={() => setDeviceIdToUpdate(device.id)}>
                                    Update
                                </Button>
                                <Button variant="destructive" onClick={() => setDeviceIdToDelete(device.id)}>
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href={prevPageHref}
                            className={clsx({ "pointer-events-none opacity-50": page === 1 })}
                            replace
                        />
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationLink href="/" className="pointer-events-none" replace>
                            {page}
                        </PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationNext
                            href={nextPageHref}
                            className={clsx({ "pointer-events-none opacity-50": page === totalPages })}
                            replace
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};
