import { Button } from "@/shadcn/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shadcn/ui/dialog";
import { trpc } from "@/utils/trpc";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback } from "react";

type DeleteUserModalProps = {
    id: string;
};

export const DeleteUserModal = ({ id }: DeleteUserModalProps) => {
    const session = useSession();
    const utils = trpc.useUtils();

    const deleteUser = trpc.user.delete.useMutation({
        async onSuccess() {
            // refetches users after a user is deleted
            await utils.user.list.invalidate();
        },
    });

    const onDeleteClick = useCallback(async () => {
        try {
            const isUpdatedCurrentUser = id === session.data?.user.id;
            await deleteUser.mutateAsync({
                id,
            });

            if (isUpdatedCurrentUser) {
                await signOut();
                await signIn();
            }
        } catch (error) {
            console.error({ error }, "Failed to delete user");
        }
    }, [deleteUser, id, session.data?.user.id]);

    return (
        <Dialog>
            <DialogTrigger>Delete</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account from our servers.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="submit" onClick={onDeleteClick} variant="destructive">
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
