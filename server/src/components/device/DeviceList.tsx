import { Error } from "@/components/Error";
import { trpc } from "@/utils/trpc";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/shadcn/ui/table";
import { Skeleton } from "@/shadcn/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationLink,
    PaginationNext,
} from "@/shadcn/ui/pagination";
import { useCallback, type FC } from "react";
import clsx from "clsx";
import Link from "next/link";
import { match, P } from "ts-pattern";
import { DeleteDeviceModal } from "../modals/DeleteDeviceModal";
import { Button } from "@/shadcn/ui/button";

export const DeviceList: FC<{
    page: number;
}> = ({ page }) => {
    const utils = trpc.useUtils();
    const deviceQuery = trpc.device.list.useQuery({ page });

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
        return <Error title={deviceQuery.error.message} statusCode={deviceQuery.error.data?.httpStatus ?? 500} />;
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
                <Link href="/devices/create">Create Device</Link>
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
                        <TableHead>ID</TableHead>
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
                            <TableCell className="font-medium">
                                <Link href={`/devices/${device.id}`}>{device.id}</Link>
                            </TableCell>
                            <TableCell>{`${device.buildingId}${device.roomId}`}</TableCell>
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
                            <TableCell className="text-right">
                                <Link href={`/devices/${device.id}`} className="mr-2">
                                    Detail
                                </Link>

                                <DeleteDeviceModal id={device.id} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href={`?page=${page - 1}`}
                            className={clsx({ "pointer-events-none opacity-50": page === 1 })}
                            shallow
                        />
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationLink href={`?page=${page}`} className="pointer-events-none" shallow>
                            {page}
                        </PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationNext
                            href={`?page=${page + 1}`}
                            className={clsx({ "pointer-events-none opacity-50": page === totalPages })}
                            shallow
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};
