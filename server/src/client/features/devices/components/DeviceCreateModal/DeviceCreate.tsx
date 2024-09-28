import { trpc } from "@/utils/trpc";
import { createDeviceSchema } from "@/server/schema/device";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/client/shadcn/ui/label";
import { Input } from "@/client/shadcn/ui/input";
import { Button } from "@/client/shadcn/ui/button";
import clsx from "clsx";
import { useCallback } from "react";

type ValidationSchema = z.infer<typeof createDeviceSchema>;

type DeviceCreateProps = {
    onCreate: () => void;
};

export const DeviceCreate = ({ onCreate }: DeviceCreateProps) => {
    const utils = trpc.useUtils();

    const createDeviceMutation = trpc.device.create.useMutation({
        async onSuccess() {
            await utils.device.list.invalidate();
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
        reset,
    } = useForm<ValidationSchema>({
        resolver: zodResolver(createDeviceSchema),
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

            {createDeviceMutation.isError && <p className="text-md mt-2 text-center text-red-500">An error occurred</p>}
        </form>
    );
};
