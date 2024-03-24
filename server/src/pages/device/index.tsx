import type { NextPageWithLayout } from "../_app";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useMemo } from "react";
import { useRouter } from "next/router";
import { DeviceList } from "@/components/device/DeviceList";

const DevicePage: NextPageWithLayout = () => {
    const router = useRouter();

    const page = useMemo(() => {
        const param = Number(router.query.page);
        const parsed = isNaN(param) ? 1 : param;

        return parsed < 1 ? 1 : parsed;
    }, [router.query.page]);

    return <DeviceList page={page} />;
};

DevicePage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default DevicePage;
