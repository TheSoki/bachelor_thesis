import type { NextPageWithLayout } from "../_app";
import { AuthLayout } from "@/client/layouts/AuthLayout";
import { useURLParams } from "@/client/hooks/useURLParams";
import { z } from "zod";
import { AuditLogList } from "@/client/features/audit-log/components/AuditLogList";
import { AuditLogsPageURLParams } from "@/client/features/audit-log/types/auditLogsPageURLParams";
import { useCallback, useMemo } from "react";

const schema = z.object({
    [AuditLogsPageURLParams.PAGE]: z
        .string()
        .transform(Number)
        .default("1")
        .transform((value) => (value > 0 ? value : 1)),
    [AuditLogsPageURLParams.LIMIT]: z
        .string()
        .transform(Number)
        .default("10")
        .transform((value) => (value > 0 ? value : 10)),
});

const AuditLogsPage: NextPageWithLayout = () => {
    const { urlState, setURLParams } = useURLParams(schema);

    const nextPageHref = useMemo(() => {
        if (!urlState.value?.page) return "/audit-logs";
        return `/audit-logs?${AuditLogsPageURLParams.PAGE}=${urlState.value.page + 1}&${AuditLogsPageURLParams.LIMIT}=${urlState.value.limit}`;
    }, [urlState.value?.limit, urlState.value?.page]);

    const prevPageHref = useMemo(() => {
        if (!urlState.value?.page) return "/audit-logs";
        return `/audit-logs?${AuditLogsPageURLParams.PAGE}=${urlState.value.page - 1}&${AuditLogsPageURLParams.LIMIT}=${urlState.value.limit}`;
    }, [urlState.value?.limit, urlState.value?.page]);

    const onSelectLimit = useCallback(
        (limit: number) => {
            setURLParams({
                [AuditLogsPageURLParams.LIMIT]: limit,
                [AuditLogsPageURLParams.PAGE]: 1,
            });
        },
        [setURLParams],
    );

    if (urlState.loading) {
        return <></>;
    }

    if (urlState.error !== null) {
        return <></>;
    }

    return (
        <AuditLogList
            page={urlState.value.page}
            limit={urlState.value.limit}
            nextPageHref={nextPageHref}
            prevPageHref={prevPageHref}
            onSelectLimit={onSelectLimit}
        />
    );
};

AuditLogsPage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default AuditLogsPage;
