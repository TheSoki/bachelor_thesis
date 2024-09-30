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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/shadcn/ui/select";

type AuditLogListProps = {
    page: number;
    limit: number;
    nextPageHref: string;
    prevPageHref: string;
    onSelectLimit: (limit: number) => void;
};

export const AuditLogList = ({ page, limit, nextPageHref, prevPageHref, onSelectLimit }: AuditLogListProps) => {
    const auditLogQuery = trpc.auditLog.list.useQuery({ page, limit });

    if (auditLogQuery.error) {
        return (
            <FullscreenError
                title={auditLogQuery.error.message}
                statusCode={auditLogQuery.error.data?.httpStatus ?? 500}
            />
        );
    }

    if (auditLogQuery.status === "pending") {
        return (
            <>
                {[...Array(10)].map((_, i) => (
                    <Skeleton className="mb-2 h-10" key={`audit-log-table-skeleton-${i}`} />
                ))}
            </>
        );
    }

    const { list, totalPages, totalCount } = auditLogQuery.data;

    return (
        <div className="py-8">
            <Table>
                <TableCaption>
                    {match(totalCount)
                        .with(
                            P.when((totalCount) => totalCount === 0),
                            () => "No audit logs",
                        )
                        .with(
                            P.when((totalCount) => totalCount === 1),
                            () => "One audit log",
                        )
                        .otherwise(() => `${totalCount} audit logs`)}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Index</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Operation</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>User IP</TableHead>
                        <TableHead>Error</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {list.map((auditLog) => (
                        <TableRow key={auditLog.id}>
                            <TableCell className="font-medium">{auditLog.index}</TableCell>
                            <TableCell>{new Date(auditLog.timestamp).toLocaleString("cs-CZ")}</TableCell>
                            <TableCell>{auditLog.operation}</TableCell>
                            <TableCell>{auditLog.userId ?? "N/A"}</TableCell>
                            <TableCell>{auditLog.userIp ?? "N/A"}</TableCell>
                            <TableCell>{auditLog.error}</TableCell>
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
