import { Error } from "@/components/Error";
import { useRouter } from "next/router";
import type { NextPageWithLayout } from "../../_app";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { DeviceEdit } from "@/components/device/DeviceEdit";

const DevicesDetailPage: NextPageWithLayout = () => {
    const router = useRouter();
    const id = router.query.id as string | undefined;

    if (!id) {
        return <Error statusCode={404} title="Page not found" />;
    }

    return <DeviceEdit id={id} />;
};

DevicesDetailPage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default DevicesDetailPage;
