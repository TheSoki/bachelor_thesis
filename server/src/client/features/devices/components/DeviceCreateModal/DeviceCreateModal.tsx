import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/shadcn/ui/dialog";
import { DeviceCreateForm } from "./DeviceCreateForm";
import { useCallback, useState } from "react";
import { useDeviceCreateModalStore } from "../../hooks/useDeviceCreateModalStore";
import { useUnsavedChangesWarning } from "@/client/hooks/useUnsavedChangesWarning";

export const DeviceCreateModal = () => {
    const isOpen = useDeviceCreateModalStore((state) => state.isOpen);
    const setIsOpen = useDeviceCreateModalStore((state) => state.setIsOpen);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const onCreate = useCallback(() => {
        setIsOpen(false);
        setHasUnsavedChanges(false);
    }, [setIsOpen]);

    const onOpenChange = useCallback(
        (isOpen: boolean) => {
            if (!isOpen && hasUnsavedChanges) {
                const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close?");
                if (!confirmClose) {
                    return;
                }
            }
            setIsOpen(isOpen);
            setHasUnsavedChanges(false);
        },
        [hasUnsavedChanges, setIsOpen],
    );

    useUnsavedChangesWarning(hasUnsavedChanges);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Device</DialogTitle>
                </DialogHeader>
                <DeviceCreateForm onCreate={onCreate} setHasUnsavedChanges={setHasUnsavedChanges} />
            </DialogContent>
        </Dialog>
    );
};
