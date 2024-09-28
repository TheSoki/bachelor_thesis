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

type UserListProps = {
    page: number;
    nextPageHref: string;
    prevPageHref: string;
};

export const UserList = ({ page, nextPageHref, prevPageHref }: UserListProps) => {
    const userQuery = trpc.user.list.useQuery({ page });
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
                    <Skeleton className="mb-2 h-10" key={`device-table-skeleton-${i}`} />
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
                            className={clsx({ "pointer-events-none opacity-50": page === totalPages })}
                            replace
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};
