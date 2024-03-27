import type { NextPageWithLayout } from "../../_app";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { UserCreate } from "@/components/user/UserCreate";

const UsersCreatePage: NextPageWithLayout = () => {
    return <UserCreate />;
};

UsersCreatePage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default UsersCreatePage;
