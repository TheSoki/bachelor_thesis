import type { NextPageWithLayout } from "../../_app";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { UserCreate } from "@/components/user/UserCreate";

const UserCreatePage: NextPageWithLayout = () => <UserCreate />;

UserCreatePage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default UserCreatePage;
