import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/shadcn/ui/dialog";
import { UserCreateForm } from "./UserCreateForm";
import { useCallback, useState } from "react";
import { useUserCreateModalStore } from "../../hooks/useUserCreateModalStore";
import { useUnsavedChangesWarning } from "@/client/hooks/useUnsavedChangesWarning";

export const UserCreateModal = () => {
    const isOpen = useUserCreateModalStore((state) => state.isOpen);
    const setIsOpen = useUserCreateModalStore((state) => state.setIsOpen);
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
                    <DialogTitle>Create User</DialogTitle>
                </DialogHeader>
                <UserCreateForm onCreate={onCreate} setHasUnsavedChanges={setHasUnsavedChanges} />
            </DialogContent>
        </Dialog>
    );
};
