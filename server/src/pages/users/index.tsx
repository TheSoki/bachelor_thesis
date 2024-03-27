import type { NextPageWithLayout } from "../_app";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useMemo } from "react";
import { useRouter } from "next/router";
import { UserList } from "@/components/user/UserList";

const UsersPage: NextPageWithLayout = () => {
    const router = useRouter();

    const page = useMemo(() => {
        const param = Number(router.query.page);
        const parsed = isNaN(param) ? 1 : param;

        return parsed < 1 ? 1 : parsed;
    }, [router.query.page]);

    return <UserList page={page} />;
};

UsersPage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default UsersPage;
