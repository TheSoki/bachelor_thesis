import { trpc } from "@/utils/trpc";
import { deviceCreateSchema } from "@/server/schema/device";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/client/shadcn/ui/label";
import { Input } from "@/client/shadcn/ui/input";
import { Button } from "@/client/shadcn/ui/button";
import clsx from "clsx";
import { useCallback, useEffect } from "react";
import { createToast } from "@/client/utils/createToast";

type ValidationSchema = z.infer<typeof deviceCreateSchema>;

type DeviceCreateProps = {
    onCreate: () => void;
    setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
};

export const DeviceCreateForm = ({ onCreate, setHasUnsavedChanges }: DeviceCreateProps) => {
    const utils = trpc.useUtils();

    const createDeviceMutation = trpc.device.create.useMutation({
        async onSuccess() {
            await utils.device.list.invalidate();
            createToast("Device created successfully", "success");
        },
        onError(error) {
            createToast(`Failed to create device: ${error.message}`, "error");
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
        reset,
    } = useForm<ValidationSchema>({
        resolver: zodResolver(deviceCreateSchema),
        defaultValues: {
            buildingId: "",
            roomId: "",
        },
    });

    useEffect(() => {
        setHasUnsavedChanges(isDirty);
    }, [isDirty, setHasUnsavedChanges]);

    const onSubmit = useCallback(
        async (data: ValidationSchema) => {
            try {
                await createDeviceMutation.mutateAsync(data);
                onCreate();
                reset();
            } catch (error) {
                console.error({ error }, "Failed to create device");
            }
        },
        [createDeviceMutation, reset, onCreate],
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
                    Create
                </Button>
            </div>
        </form>
    );
};
