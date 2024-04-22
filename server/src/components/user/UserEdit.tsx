import { Error } from "@/components/Error";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { UserEditForm } from "./UserEditForm";

type UserEditProps = {
    id: string;
};

export const UserEdit = ({ id }: UserEditProps) => {
    const userQuery = trpc.user.getById.useQuery({ id });

    if (userQuery.error) {
        return <Error title={userQuery.error.message} statusCode={userQuery.error.data?.httpStatus ?? 500} />;
    }

    if (userQuery.status !== "success") {
        return (
            <>
                <Skeleton className="mb-2 h-10 w-1/2" />
                <Skeleton className="mb-2 h-10 w-1/3" />
                <Skeleton className="mb-2 h-10 w-2/4" />
            </>
        );
    }

    return <UserEditForm user={userQuery.data} />;
};
