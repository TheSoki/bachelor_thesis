import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/shadcn/ui/dialog";
import { DeviceUpdate } from "./DeviceUpdate";
import { useCallback, useMemo } from "react";
import { useDeviceUpdateModalStore } from "../../hooks/useDeviceUpdateModalStore";

export const DeviceUpdateModal = () => {
    const deviceId = useDeviceUpdateModalStore((state) => state.deviceId);
    const setDeviceId = useDeviceUpdateModalStore((state) => state.setDeviceId);

    const open = useMemo(() => !!deviceId, [deviceId]);
    const onUpdate = useCallback(() => setDeviceId(null), [setDeviceId]);

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
                    <DialogTitle>Update Device</DialogTitle>
                </DialogHeader>
                {deviceId && <DeviceUpdate id={deviceId} onUpdate={onUpdate} />}
            </DialogContent>
        </Dialog>
    );
};
