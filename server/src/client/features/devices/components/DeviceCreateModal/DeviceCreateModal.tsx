import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/shadcn/ui/dialog";
import { DeviceCreate } from "./DeviceCreate";
import { useCallback } from "react";
import { useDeviceCreateModalStore } from "../../hooks/useDeviceCreateModalStore";

export const DeviceCreateModal = () => {
    const isOpen = useDeviceCreateModalStore((state) => state.isOpen);
    const setIsOpen = useDeviceCreateModalStore((state) => state.setIsOpen);
    const onCreate = useCallback(() => setIsOpen(false), [setIsOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Device</DialogTitle>
                </DialogHeader>
                <DeviceCreate onCreate={onCreate} />
            </DialogContent>
        </Dialog>
    );
};
