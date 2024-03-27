import type { NextPageWithLayout } from "../../_app";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { DeviceCreate } from "@/components/device/DeviceCreate";

const DevicesCreatePage: NextPageWithLayout = () => {
    return <DeviceCreate />;
};

DevicesCreatePage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default DevicesCreatePage;
