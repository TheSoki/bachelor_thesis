import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/shadcn/ui/dialog";
import { useCallback, useMemo, useState } from "react";
import { useDeviceUpdateModalStore } from "../../hooks/useDeviceUpdateModalStore";
import { useUnsavedChangesWarning } from "@/client/hooks/useUnsavedChangesWarning";
import { trpc } from "@/utils/trpc";
import { P, match } from "ts-pattern";
import { Skeleton } from "@/client/shadcn/ui/skeleton";
import { DeviceUpdateForm } from "./DeviceUpdateForm";

export const DeviceUpdateModal = () => {
    const deviceId = useDeviceUpdateModalStore((state) => state.deviceId);
    const setDeviceId = useDeviceUpdateModalStore((state) => state.setDeviceId);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const open = useMemo(() => !!deviceId, [deviceId]);
    const onUpdate = useCallback(() => {
        setDeviceId(null);
        setHasUnsavedChanges(false);
    }, [setDeviceId]);

    const onOpenChange = useCallback(
        (isOpen: boolean) => {
            if (!isOpen && hasUnsavedChanges) {
                const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close?");
                if (!confirmClose) {
                    return;
                }
            }
            setDeviceId(isOpen ? deviceId : null);
            setHasUnsavedChanges(false);
        },
        [deviceId, hasUnsavedChanges, setDeviceId],
    );

    const deviceQuery = trpc.device.getById.useQuery(
        { id: deviceId ?? "" },
        {
            enabled: !!deviceId,
        },
    );

    useUnsavedChangesWarning(hasUnsavedChanges);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Device</DialogTitle>
                </DialogHeader>
                {match(deviceQuery)
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
                        <DeviceUpdateForm
                            device={data!}
                            onUpdate={onUpdate}
                            setHasUnsavedChanges={setHasUnsavedChanges}
                        />
                    ))}
            </DialogContent>
        </Dialog>
    );
};
