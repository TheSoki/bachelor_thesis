import { trpc } from "@/utils/trpc";
import { Skeleton } from "@/client/shadcn/ui/skeleton";
import { UserUpdateForm } from "./UserUpdateForm";

type UserUpdateProps = {
    id: string;
    onUpdate: () => void;
};

export const UserUpdate = ({ id, onUpdate }: UserUpdateProps) => {
    const userQuery = trpc.user.getById.useQuery({ id });

    if (userQuery.error) {
        return (
            <div className="text-center">
                <h2 className="text-5xl font-bold">{userQuery.error.data?.httpStatus ?? 500}</h2>
                <h3 className="mb-4 text-xl font-bold">{userQuery.error.message}</h3>
            </div>
        );
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

    return <UserUpdateForm user={userQuery.data} onUpdate={onUpdate} />;
};
