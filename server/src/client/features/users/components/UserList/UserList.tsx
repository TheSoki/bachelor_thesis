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
import clsx from "clsx";
import { match, P } from "ts-pattern";
import { Button } from "@/client/shadcn/ui/button";
import { useUserCreateModalStore } from "../../hooks/useUserCreateModalStore";
import { useUserDeleteModalStore } from "../../hooks/useUserDeleteModalStore";
import { useUserUpdateModalStore } from "../../hooks/useUserUpdateModalStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/shadcn/ui/select";
import type { z } from "zod";
import type { usersPageURLParamsSchema } from "../../types/usersPageURLParams";
import { SearchBar } from "@/client/components/SearchBar";

type UserListProps = {
    urlParams: z.infer<typeof usersPageURLParamsSchema>;
    nextPageHref: string;
    prevPageHref: string;
    onSelectLimit: (limit: number) => void;
    onSearchSubmit: (search: string) => void;
};

export const UserList = ({ urlParams, nextPageHref, prevPageHref, onSelectLimit, onSearchSubmit }: UserListProps) => {
    const { page, limit, search } = urlParams;

    const userQuery = trpc.user.list.useQuery({ page, limit, search });
    const setUserIdToDelete = useUserDeleteModalStore((state) => state.setUserId);
    const setUserIdToUpdate = useUserUpdateModalStore((state) => state.setUserId);
    const openCreateUserModal = useUserCreateModalStore((state) => state.setIsOpen);

    if (userQuery.error) {
        return <FullscreenError title={userQuery.error.message} statusCode={userQuery.error.data?.httpStatus ?? 500} />;
    }

    if (userQuery.status === "pending") {
        return (
            <>
                {[...Array(10)].map((_, i) => (
                    <Skeleton className="mb-2 h-10" key={`user-table-skeleton-${i}`} />
                ))}
            </>
        );
    }

    const { list, totalPages, totalCount } = userQuery.data;

    return (
        <div className="py-8">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-3xl font-semibold">Users</h2>
                <Button variant="secondary" onClick={() => openCreateUserModal(true)}>
                    Create User
                </Button>
            </div>

            <SearchBar defaultValue={search} onSubmit={onSearchSubmit} />

            <Table>
                <TableCaption>
                    {match(totalCount)
                        .with(
                            P.when((totalCount) => totalCount === 0),
                            () => "No users",
                        )
                        .with(
                            P.when((totalCount) => totalCount === 1),
                            () => "One user",
                        )
                        .otherwise(() => `${totalCount} users`)}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="w-[150px] text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {list.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.createdAt.toLocaleString("cs-CZ")}</TableCell>
                            <TableCell className="flex items-center justify-end space-x-2">
                                <Button variant="secondary" onClick={() => setUserIdToUpdate(user.id)}>
                                    Update
                                </Button>
                                <Button variant="destructive" onClick={() => setUserIdToDelete(user.id)}>
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
