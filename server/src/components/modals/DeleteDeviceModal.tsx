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
import { useCallback } from "react";

type DeleteDeviceModalProps = {
    id: string;
};

export const DeleteDeviceModal = ({ id }: DeleteDeviceModalProps) => {
    const utils = trpc.useUtils();

    const deleteDevice = trpc.device.delete.useMutation({
        async onSuccess() {
            // refetches devices after a device is deleted
            await utils.device.list.invalidate();
        },
    });

    const onDeleteClick = useCallback(async () => {
        try {
            await deleteDevice.mutateAsync({
                id,
            });
        } catch (error) {
            console.error({ error }, "Failed to delete device");
        }
    }, [deleteDevice, id]);

    return (
        <Dialog>
            <DialogTrigger>Delete</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete this device from our servers.
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
