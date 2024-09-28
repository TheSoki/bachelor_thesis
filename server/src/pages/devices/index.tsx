import type { NextPageWithLayout } from "../_app";
import { AuthLayout } from "@/client/layouts/AuthLayout";
import { useURLParams } from "@/client/hooks/useURLParams";
import { z } from "zod";
import { DeviceCreateModal } from "@/client/features/devices/components/DeviceCreateModal";
import { DeviceDeleteModal } from "@/client/features/devices/components/DeviceDeleteModal";
import { DeviceList } from "@/client/features/devices/components/DeviceList";
import { DeviceUpdateModal } from "@/client/features/devices/components/DeviceUpdateModal";
import { DevicesPageURLParams } from "@/client/features/users/types/usersPageURLParams";
import { useMemo } from "react";

const schema = z.object({
    [DevicesPageURLParams.PAGE]: z
        .string()
        .transform(Number)
        .default("1")
        .transform((value) => (value > 0 ? value : 1)),
});

const DevicesPage: NextPageWithLayout = () => {
    const { urlState } = useURLParams(schema);

    const nextPageHref = useMemo(() => {
        if (!urlState.value?.page) return "/devices";
        return `/devices?page=${urlState.value.page + 1}`;
    }, [urlState.value?.page]);
    const prevPageHref = useMemo(() => {
        if (!urlState.value?.page) return "/devices";
        return `/devices?page=${urlState.value.page - 1}`;
    }, [urlState.value?.page]);

    if (urlState.loading) {
        return <></>;
    }

    if (urlState.error !== null) {
        return <></>;
    }

    return (
        <>
            <DeviceList page={urlState.value.page} nextPageHref={nextPageHref} prevPageHref={prevPageHref} />
            <DeviceDeleteModal />
            <DeviceCreateModal />
            <DeviceUpdateModal />
        </>
    );
};

DevicesPage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default DevicesPage;
