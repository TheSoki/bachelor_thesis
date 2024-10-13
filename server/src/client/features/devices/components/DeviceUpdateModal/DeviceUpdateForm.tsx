import { trpc, type RouterOutput } from "@/utils/trpc";
import { deviceUpdateSchema } from "@/server/schema/device";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/client/shadcn/ui/label";
import { Input } from "@/client/shadcn/ui/input";
import { Button } from "@/client/shadcn/ui/button";
import clsx from "clsx";
import { useCallback, useEffect, useMemo } from "react";
import { createToast } from "@/client/utils/createToast";

type ValidationSchema = z.infer<typeof deviceUpdateSchema>;

type DeviceByIdOutput = RouterOutput["device"]["getById"];

type DeviceUpdateFormProps = {
    device: DeviceByIdOutput;
    onUpdate: () => void;
    setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
};

export const DeviceUpdateForm = ({ device, onUpdate, setHasUnsavedChanges }: DeviceUpdateFormProps) => {
    const utils = trpc.useUtils();

    const updateDeviceMutation = trpc.device.update.useMutation({
        async onSuccess() {
            await utils.device.list.invalidate();
            createToast("Device updated successfully", "success");
        },
        onError(error) {
            createToast(`Failed to update device: ${error.message}`, "error");
        },
    });

    const defaultValues = useMemo(
        () => ({
            id: device.id,
            buildingId: device.buildingId,
            roomId: device.roomId,
        }),
        [device],
    );

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
        reset,
    } = useForm<ValidationSchema>({
        resolver: zodResolver(deviceUpdateSchema),
        defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device]);

    useEffect(() => {
        setHasUnsavedChanges(isDirty);
    }, [isDirty, setHasUnsavedChanges]);

    const onSubmit = useCallback(
        async (data: ValidationSchema) => {
            try {
                await updateDeviceMutation.mutateAsync(data);
                onUpdate();
                reset(data);
            } catch (error) {
                console.error({ error }, "Failed to update device");
            }
        },
        [onUpdate, reset, updateDeviceMutation],
    );

    return (
        <form className="mb-4 px-8 pb-8" onSubmit={handleSubmit((data) => onSubmit(data))}>
            <div className="mb-4">
                <Label htmlFor="buildingId" className="mb-2">
                    Building ID
                </Label>
                <Input
                    className={clsx({
                        "border-red-500 dark:border-red-400": errors.buildingId,
                    })}
                    id="buildingId"
                    type="text"
                    {...register("buildingId")}
                />
                {errors.buildingId && (
                    <p className="mt-2 text-xs italic text-red-500 dark:text-red-400">{errors.buildingId?.message}</p>
                )}
            </div>

            <div className="mb-4">
                <Label htmlFor="roomId" className="mb-2">
                    Room ID
                </Label>
                <Input
                    className={clsx({
                        "border-red-500 dark:border-red-400": errors.roomId,
                    })}
                    id="roomId"
                    type="text"
                    {...register("roomId")}
                />
                {errors.roomId && (
                    <p className="mt-2 text-xs italic text-red-500 dark:text-red-400">{errors.roomId?.message}</p>
                )}
            </div>

            <div className="mb-6 text-center">
                <Button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                >
                    Update
                </Button>
            </div>
        </form>
    );
};
