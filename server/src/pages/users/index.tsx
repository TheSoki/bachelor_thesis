import type { NextPageWithLayout } from "../_app";
import { AuthLayout } from "@/client/layouts/AuthLayout";
import { useURLParams } from "@/client/hooks/useURLParams";
import { UserCreateModal } from "@/client/features/users/components/UserCreateModal";
import { UserDeleteModal } from "@/client/features/users/components/UserDeleteModal";
import { UserList } from "@/client/features/users/components/UserList";
import { UserUpdateModal } from "@/client/features/users/components/UserUpdateModal";
import { UsersPageURLParams, usersPageURLParamsSchema } from "@/client/features/users/types/usersPageURLParams";
import { useCallback, useMemo } from "react";

const UsersPage: NextPageWithLayout = () => {
    const { urlState, setURLParams } = useURLParams(usersPageURLParamsSchema);

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

    const onSearchSubmit = useCallback(
        (search: string) => {
            setURLParams({
                [UsersPageURLParams.SEARCH]: search,
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
                urlParams={urlState.value}
                nextPageHref={nextPageHref}
                prevPageHref={prevPageHref}
                onSelectLimit={onSelectLimit}
                onSearchSubmit={onSearchSubmit}
            />

            <UserDeleteModal />
            <UserCreateModal />
            <UserUpdateModal />
        </>
    );
};

UsersPage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default UsersPage;
