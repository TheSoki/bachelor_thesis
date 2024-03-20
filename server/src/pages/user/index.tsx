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

const UserPage: NextPageWithLayout = () => {
    const router = useRouter();

    const queryParamPage = useMemo(() => {
        const page = Number(router.query.page);
        return isNaN(page) ? 1 : page;
    }, [router.query.page]);

    const userQuery = trpc.user.list.useQuery({ page: queryParamPage < 1 ? 1 : queryParamPage });

    if (userQuery.error) {
        return <Error title={userQuery.error.message} statusCode={userQuery.error.data?.httpStatus ?? 500} />;
    }

    if (userQuery.status === "pending") {
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
                        key={`user-table-skeleton-${i}`}
                    />
                ))}
            </>
        );
    }

    const { list, page, totalPages, totalCount } = userQuery.data;

    return (
        <div className="py-8">
            <h2 className="text-3xl font-semibold">Users</h2>

            <Table>
                <TableCaption>{totalCount} users</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[400px]">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {list.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                <Link href={`/user/${user.id}`}>{user.id}</Link>
                            </TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.createdAt.toLocaleString("cs-CZ")}</TableCell>
                            <TableCell className="text-right">
                                <Link href={`/user/${user.id}`}>Detail</Link>
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
                            className={clsx({
                                "pointer-events-none opacity-50": page === 1 || page < 0 || page > totalPages,
                            })}
                            shallow
                        />
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationLink href={`?page=${page}`} className="pointer-events-none opacity-50" shallow>
                            {page}
                        </PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationNext
                            href={`?page=${page + 1}`}
                            className={clsx({
                                "pointer-events-none opacity-50": page === totalPages || page < 0 || page > totalPages,
                            })}
                            shallow
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

UserPage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default UserPage;
