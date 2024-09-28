import { Button } from "@/client/shadcn/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/client/shadcn/ui/dialog";
import { trpc } from "@/utils/trpc";
import { useCallback, useMemo } from "react";
import { useDeviceDeleteModalStore } from "../../hooks/useDeviceDeleteModalStore";

export const DeviceDeleteModal = () => {
    const utils = trpc.useUtils();
    const deviceId = useDeviceDeleteModalStore((state) => state.deviceId);
    const setDeviceId = useDeviceDeleteModalStore((state) => state.setDeviceId);

    const deleteDevice = trpc.device.delete.useMutation({
        async onSuccess() {
            await utils.device.list.invalidate();
            setDeviceId(null);
        },
    });

    const onDeleteClick = useCallback(async () => {
        if (!deviceId) return;
        try {
            await deleteDevice.mutateAsync({
                id: deviceId,
            });
        } catch (error) {
            console.error({ error }, "Failed to delete device");
        }
    }, [deleteDevice, deviceId]);

    const open = useMemo(() => !!deviceId, [deviceId]);

    const onOpenChange = useCallback(
        (isOpen: boolean) => {
            setDeviceId(isOpen ? deviceId : null);
        },
        [deviceId, setDeviceId],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Device</DialogTitle>
                    <DialogDescription>
                        Are you absolutely sure? This action cannot be undone. This will permanently delete this device
                        from our servers.
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
