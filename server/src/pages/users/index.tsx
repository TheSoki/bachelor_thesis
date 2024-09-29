import type { NextPageWithLayout } from "../_app";
import { AuthLayout } from "@/client/layouts/AuthLayout";
import { useURLParams } from "@/client/hooks/useURLParams";
import { z } from "zod";
import { UserCreateModal } from "@/client/features/users/components/UserCreateModal";
import { UserDeleteModal } from "@/client/features/users/components/UserDeleteModal";
import { UserList } from "@/client/features/users/components/UserList";
import { UserUpdateModal } from "@/client/features/users/components/UserUpdateModal";
import { UsersPageURLParams } from "@/client/features/devices/types/devicesPageURLParams";
import { useCallback, useMemo } from "react";

const schema = z.object({
    [UsersPageURLParams.PAGE]: z
        .string()
        .transform(Number)
        .default("1")
        .transform((value) => (value > 0 ? value : 1)),
    [UsersPageURLParams.LIMIT]: z
        .string()
        .transform(Number)
        .default("10")
        .transform((value) => (value > 0 ? value : 10)),
});

const UsersPage: NextPageWithLayout = () => {
    const { urlState, setURLParams } = useURLParams(schema);

    const nextPageHref = useMemo(() => {
        if (!urlState.value?.page) return "/users";
        return `/users?${UsersPageURLParams.PAGE}=${urlState.value.page + 1}&${UsersPageURLParams.LIMIT}=${urlState.value.limit}`;
    }, [urlState.value?.limit, urlState.value?.page]);

    const prevPageHref = useMemo(() => {
        if (!urlState.value?.page) return "/users";
        return `/users?${UsersPageURLParams.PAGE}=${urlState.value.page - 1}&${UsersPageURLParams.LIMIT}=${urlState.value.limit}`;
    }, [urlState.value?.limit, urlState.value?.page]);

    const onSelectLimit = useCallback(
        (limit: number) => {
            setURLParams({
                [UsersPageURLParams.LIMIT]: limit,
                [UsersPageURLParams.PAGE]: 1,
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
            <UserList
                page={urlState.value.page}
                limit={urlState.value.limit}
                nextPageHref={nextPageHref}
                prevPageHref={prevPageHref}
                onSelectLimit={onSelectLimit}
            />

            <UserDeleteModal />
            <UserCreateModal />
            <UserUpdateModal />
        </>
    );
};

UsersPage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default UsersPage;
