import type { NextPageWithLayout } from "../../_app";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { DeviceCreate } from "@/components/device/DeviceCreate";

const DeviceCreatePage: NextPageWithLayout = () => <DeviceCreate />;

DeviceCreatePage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default DeviceCreatePage;
