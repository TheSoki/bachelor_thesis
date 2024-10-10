import { trpc } from "@/utils/trpc";
import { deviceCreateSchema } from "@/server/schema/device";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/client/shadcn/ui/label";
import { Input } from "@/client/shadcn/ui/input";
import { Button } from "@/client/shadcn/ui/button";
import clsx from "clsx";
import { useCallback } from "react";
import { createToast } from "@/client/utils/createToast";

type ValidationSchema = z.infer<typeof deviceCreateSchema>;

type DeviceCreateProps = {
    onCreate: () => void;
};

export const DeviceCreate = ({ onCreate }: DeviceCreateProps) => {
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

    const onSubmit = useCallback(
        async (data: ValidationSchema) => {
            try {
                await createDeviceMutation.mutateAsync(data);
                reset();
                onCreate();
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
                    Confirm
                </Button>
            </div>
        </form>
    );
};
