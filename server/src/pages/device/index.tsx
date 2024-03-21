import { Error } from "@/components/Error";
import { trpc } from "@/utils/trpc";
import type { NextPageWithLayout } from "../_app";
import { AuthLayout } from "@/components/layouts/AuthLayout";
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
import { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import clsx from "clsx";
import Link from "next/link";
import { Button } from "@/shadcn/ui/button";
import { match, P } from "ts-pattern";
import { DeleteDeviceModal } from "@/components/modals/DeleteDeviceModal";

const DevicePage: NextPageWithLayout = () => {
    const router = useRouter();
    const utils = trpc.useUtils();

    const queryParamPage = useMemo(() => {
        const page = Number(router.query.page);
        return isNaN(page) ? 1 : page;
    }, [router.query.page]);

    const deviceQuery = trpc.device.list.useQuery({ page: queryParamPage < 1 ? 1 : queryParamPage });

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

    const { list, page, totalPages, totalCount } = deviceQuery.data;

    return (
        <div className="py-8">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-3xl font-semibold">Devices</h2>
                <Link href="/device/create">Create Device</Link>
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
                        <TableHead className="w-[400px]">ID</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Last Seen At</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {list.map((device) => (
                        <TableRow key={device.id}>
                            <TableCell className="font-medium">
                                <Link href={`/device/${device.id}`}>{device.id}</Link>
                            </TableCell>
                            <TableCell>{`${device.buildingId}${device.roomId}`}</TableCell>
                            <TableCell>{`${device.displayWidth}x${device.displayHeight}`}</TableCell>
                            <TableCell>
                                {device.lastSeen ? new Date(device.lastSeen).toLocaleString("cs-CZ") : "Never"}
                            </TableCell>
                            <TableCell>
                                <Button onClick={() => onCopyTokenClick(device.id)} variant="ghost" size="sm">
                                    Copy to clipboard
                                </Button>
                            </TableCell>
                            <TableCell>{device.author?.name ?? <i>DELETED</i>}</TableCell>
                            <TableCell>{device.createdAt.toLocaleString("cs-CZ")}</TableCell>
                            <TableCell className="text-right">
                                <Link href={`/device/${device.id}`} className="mr-2">
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

DevicePage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default DevicePage;
