import type { NextPageWithLayout } from "../_app";
import { AuthLayout } from "@/client/layouts/AuthLayout";
import { useURLParams } from "@/client/hooks/useURLParams";
import { DeviceCreateModal } from "@/client/features/devices/components/DeviceCreateModal";
import { DeviceDeleteModal } from "@/client/features/devices/components/DeviceDeleteModal";
import { DeviceList } from "@/client/features/devices/components/DeviceList";
import { DeviceUpdateModal } from "@/client/features/devices/components/DeviceUpdateModal";
import { DevicesPageURLParams, devicesPageURLParamsSchema } from "@/client/features/devices/types/devicesPageURLParams";
import { useCallback, useMemo } from "react";

const DevicesPage: NextPageWithLayout = () => {
    const { urlState, setURLParams } = useURLParams(devicesPageURLParamsSchema);

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

    const onSearchSubmit = useCallback(
        (search: string) => {
            setURLParams({
                [DevicesPageURLParams.SEARCH]: search,
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
                urlParams={urlState.value}
                nextPageHref={nextPageHref}
                prevPageHref={prevPageHref}
                onSelectLimit={onSelectLimit}
                onSearchSubmit={onSearchSubmit}
            />
            <DeviceDeleteModal />
            <DeviceCreateModal />
            <DeviceUpdateModal />
        </>
    );
};

DevicesPage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default DevicesPage;
