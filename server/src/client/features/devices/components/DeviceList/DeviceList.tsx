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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/shadcn/ui/select";
import type { devicesPageURLParamsSchema } from "../../types/devicesPageURLParams";
import type { z } from "zod";
import { copyToClipboard } from "@/client/utils/copyToClipboard";
import { SearchBar } from "@/client/components/SearchBar";
import CopyIcon from "@/client/icons/copy.svg";

type DeviceListProps = {
    urlParams: z.infer<typeof devicesPageURLParamsSchema>;
    nextPageHref: string;
    prevPageHref: string;
    onSelectLimit: (limit: number) => void;
    onSearchSubmit: (search: string) => void;
};

export const DeviceList = ({
    urlParams,
    nextPageHref,
    prevPageHref,
    onSelectLimit,
    onSearchSubmit,
}: DeviceListProps) => {
    const { page, limit, search } = urlParams;

    const utils = trpc.useUtils();
    const deviceQuery = trpc.device.list.useQuery({ page, limit, search });
    const setDeviceIdToDelete = useDeviceDeleteModalStore((state) => state.setDeviceId);
    const setDeviceIdToUpdate = useDeviceUpdateModalStore((state) => state.setDeviceId);
    const openCreateDeviceModal = useDeviceCreateModalStore((state) => state.setIsOpen);

    const onCopyTokenClick = useCallback(
        async (id: string) => {
            try {
                const data = await utils.device.getDeviceToken.fetch({
                    id,
                });

                await copyToClipboard(data.token);
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

            <SearchBar defaultValue={search} onSubmit={onSearchSubmit} />

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
                        <TableHead>Device ID</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="w-[150px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {list.map((device) => (
                        <TableRow key={device.id}>
                            <TableCell className="whitespace-nowrap font-medium">{`${device.buildingId}${device.roomId}`}</TableCell>
                            <TableCell className="whitespace-nowrap">
                                {device.lastSeen ? new Date(device.lastSeen).toLocaleString("cs-CZ") : <i>Never</i>}
                            </TableCell>
                            <TableCell>
                                <Button
                                    onClick={async () => {
                                        await copyToClipboard(device.id);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                >
                                    <CopyIcon className="h-4 w-4" />
                                    <span className="ml-1">Copy</span>
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button onClick={() => onCopyTokenClick(device.id)} variant="ghost" size="sm">
                                    <CopyIcon className="h-4 w-4" />
                                    <span className="ml-1">Copy</span>
                                </Button>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{device.author?.name ?? <i>Deleted</i>}</TableCell>
                            <TableCell className="whitespace-nowrap">
                                {device.createdAt.toLocaleString("cs-CZ")}
                            </TableCell>
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
                            className={clsx({ "pointer-events-none opacity-50": page >= totalPages })}
                            replace
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>

            <div className="mt-4 flex w-full items-center justify-end">
                <Select onValueChange={(value: string) => onSelectLimit(Number(value))} value={limit.toString()}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Items per page" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="25">25 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};
