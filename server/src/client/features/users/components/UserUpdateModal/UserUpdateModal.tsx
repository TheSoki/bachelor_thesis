import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/shadcn/ui/dialog";
import { useCallback, useMemo, useState } from "react";
import { useUserUpdateModalStore } from "../../hooks/useUserUpdateModalStore";
import { P, match } from "ts-pattern";
import { trpc } from "@/utils/trpc";
import { useUnsavedChangesWarning } from "@/client/hooks/useUnsavedChangesWarning";
import { Skeleton } from "@/client/shadcn/ui/skeleton";
import { UserUpdateForm } from "./UserUpdateForm";

export const UserUpdateModal = () => {
    const userId = useUserUpdateModalStore((state) => state.userId);
    const setUserId = useUserUpdateModalStore((state) => state.setUserId);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const open = useMemo(() => !!userId, [userId]);
    const onUpdate = useCallback(() => {
        setUserId(null);
        setHasUnsavedChanges(false);
    }, [setUserId]);

    const onOpenChange = useCallback(
        (isOpen: boolean) => {
            if (!isOpen && hasUnsavedChanges) {
                const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close?");
                if (!confirmClose) {
                    return;
                }
            }
            setUserId(isOpen ? userId : null);
            setHasUnsavedChanges(false);
        },
        [hasUnsavedChanges, setUserId, userId],
    );

    const userQuery = trpc.user.getById.useQuery(
        { id: userId ?? "" },
        {
            enabled: !!userId,
        },
    );

    useUnsavedChangesWarning(hasUnsavedChanges);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update User</DialogTitle>
                </DialogHeader>
                {match(userQuery)
                    .with(
                        P.when(({ error }) => !!error),
                        ({ error }) => (
                            <div className="text-center">
                                <h2 className="text-5xl font-bold">{error!.data?.httpStatus ?? 500}</h2>
                                <h3 className="mb-4 text-xl font-bold">{error!.message}</h3>
                            </div>
                        ),
                    )
                    .with(
                        P.when(({ status }) => status === "pending"),
                        () => (
                            <>
                                <Skeleton className="mb-2 h-10 w-1/2" />
                                <Skeleton className="mb-2 h-10 w-1/3" />
                                <Skeleton className="mb-2 h-10 w-2/4" />
                            </>
                        ),
                    )
                    .otherwise(({ data }) => (
                        <UserUpdateForm user={data!} onUpdate={onUpdate} setHasUnsavedChanges={setHasUnsavedChanges} />
                    ))}
            </DialogContent>
        </Dialog>
    );
};
