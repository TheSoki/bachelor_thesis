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
import { useMemo } from "react";
import { useRouter } from "next/router";
import clsx from "clsx";
import Link from "next/link";

const DevicePage: NextPageWithLayout = () => {
    const router = useRouter();

    const queryParamPage = useMemo(() => {
        const page = Number(router.query.page);
        return isNaN(page) ? 1 : page;
    }, [router.query.page]);

    const deviceQuery = trpc.device.list.useQuery({ page: queryParamPage < 1 ? 1 : queryParamPage });

    if (deviceQuery.error) {
        return <Error title={deviceQuery.error.message} statusCode={deviceQuery.error.data?.httpStatus ?? 500} />;
    }

    if (deviceQuery.status === "pending") {
        return (
            <>
                {[...Array(10)].map((_, i) => (
                    <Skeleton
                        className={clsx("mb-2 h-10", {
                            "w-1/2": i % 2 === 0,
                            "w-1/3": i % 3 === 0,
                            "w-1/4": i % 4 === 0,
                            "w-1/5": i % 5 === 0,
                        })}
                        key={`device-table-skeleton-${i}`}
                    />
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
                <TableCaption>{totalCount} devices</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[400px]">ID</TableHead>
                        <TableHead>Room</TableHead>
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
                            <TableCell>{device.createdAt.toLocaleString("cs-CZ")}</TableCell>
                            <TableCell className="text-right">
                                <Link href={`/device/${device.id}`}>Detail</Link>
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
