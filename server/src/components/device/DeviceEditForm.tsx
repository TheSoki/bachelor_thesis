import { trpc, type RouterOutput } from "@/utils/trpc";
import { updateDeviceSchema } from "@/server/schema/device";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import clsx from "clsx";
import { useCallback, useEffect, useMemo } from "react";

type ValidationSchema = z.infer<typeof updateDeviceSchema>;

type DeviceByIdOutput = RouterOutput["device"]["getById"];

type DeviceEditFormProps = {
    device: DeviceByIdOutput;
};

export const DeviceEditForm = ({ device }: DeviceEditFormProps) => {
    const utils = trpc.useUtils();

    const updateDeviceMutation = trpc.device.update.useMutation({
        async onSuccess() {
            // refetches device after a device is added
            await utils.device.getById.invalidate({
                id: device.id,
            });
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
        reset,
    } = useForm<ValidationSchema>({
        resolver: zodResolver(updateDeviceSchema),
        defaultValues: useMemo(
            () => ({
                id: device.id,
                buildingId: device.buildingId,
                roomId: device.roomId,
            }),
            [device],
        ),
    });

    useEffect(() => {
        reset({
            id: device.id,
            buildingId: device.buildingId,
            roomId: device.roomId,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device]);

    const onSubmit = useCallback(
        async (data: ValidationSchema) => {
            try {
                await updateDeviceMutation.mutateAsync(data);

                reset();
            } catch (error) {
                console.error({ error }, "Failed to update device");
            }
        },
        [reset, updateDeviceMutation],
    );

    return (
        <form className="mb-4 px-8 pb-8" onSubmit={handleSubmit((data) => onSubmit(data))}>
            <div className="mb-4">
                <Label htmlFor="buildingId" className="mb-2">
                    Building ID
                </Label>
                <Input
                    className={clsx({
                        "border-red-500": errors.buildingId,
                    })}
                    id="buildingId"
                    type="text"
                    {...register("buildingId")}
                />
                {errors.buildingId && <p className="mt-2 text-xs italic text-red-500">{errors.buildingId?.message}</p>}
            </div>

            <div className="mb-4">
                <Label htmlFor="roomId" className="mb-2">
                    Room ID
                </Label>
                <Input
                    className={clsx({
                        "border-red-500": errors.roomId,
                    })}
                    id="roomId"
                    type="text"
                    {...register("roomId")}
                />
                {errors.roomId && <p className="mt-2 text-xs italic text-red-500">{errors.roomId?.message}</p>}
            </div>

            <div className="mb-6 text-center">
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                    Update Device
                </Button>
            </div>

            {updateDeviceMutation.isError && <p className="text-md mt-2 text-center text-red-500">An error occurred</p>}
        </form>
    );
};
