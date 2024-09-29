import type { NextPageWithLayout } from "../_app";
import { AuthLayout } from "@/client/layouts/AuthLayout";
import { useURLParams } from "@/client/hooks/useURLParams";
import { z } from "zod";
import { DeviceCreateModal } from "@/client/features/devices/components/DeviceCreateModal";
import { DeviceDeleteModal } from "@/client/features/devices/components/DeviceDeleteModal";
import { DeviceList } from "@/client/features/devices/components/DeviceList";
import { DeviceUpdateModal } from "@/client/features/devices/components/DeviceUpdateModal";
import { DevicesPageURLParams } from "@/client/features/users/types/usersPageURLParams";
import { useCallback, useMemo } from "react";

const schema = z.object({
    [DevicesPageURLParams.PAGE]: z
        .string()
        .transform(Number)
        .default("1")
        .transform((value) => (value > 0 ? value : 1)),
    [DevicesPageURLParams.LIMIT]: z
        .string()
        .transform(Number)
        .default("10")
        .transform((value) => (value > 0 ? value : 10)),
});

const DevicesPage: NextPageWithLayout = () => {
    const { urlState, setURLParams } = useURLParams(schema);

    const nextPageHref = useMemo(() => {
        if (!urlState.value?.page) return "/devices";
        return `/devices?${DevicesPageURLParams.PAGE}=${urlState.value.page + 1}&${DevicesPageURLParams.LIMIT}=${urlState.value.limit}`;
    }, [urlState.value?.limit, urlState.value?.page]);

    const prevPageHref = useMemo(() => {
        if (!urlState.value?.page) return "/devices";
        return `/devices?${DevicesPageURLParams.PAGE}=${urlState.value.page - 1}&${DevicesPageURLParams.LIMIT}=${urlState.value.limit}`;
    }, [urlState.value?.limit, urlState.value?.page]);

    const onSelectLimit = useCallback(
        (limit: number) => {
            setURLParams({
                [DevicesPageURLParams.LIMIT]: limit,
                [DevicesPageURLParams.PAGE]: 1,
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
        <>
            <DeviceList
                page={urlState.value.page}
                limit={urlState.value.limit}
                nextPageHref={nextPageHref}
                prevPageHref={prevPageHref}
                onSelectLimit={onSelectLimit}
            />
            <DeviceDeleteModal />
            <DeviceCreateModal />
            <DeviceUpdateModal />
        </>
    );
};

DevicesPage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default DevicesPage;
