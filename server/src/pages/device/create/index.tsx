import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import type { NextPageWithLayout } from "../../_app";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { createDeviceSchema } from "@/server/schema/device";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import clsx from "clsx";
import { useCallback } from "react";

type ValidationSchema = z.infer<typeof createDeviceSchema>;

const DeviceCreatePage: NextPageWithLayout = () => {
    const router = useRouter();

    const createDeviceMutation = trpc.device.add.useMutation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ValidationSchema>({
        resolver: zodResolver(createDeviceSchema),
    });

    const onSubmit = useCallback(
        async (data: ValidationSchema) => {
            try {
                await createDeviceMutation.mutateAsync(data);

                reset();
                router.push("/device");
            } catch (error) {
                console.error({ error }, "Failed to update device");
            }
        },
        [reset, router, createDeviceMutation],
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
                <Button type="submit" disabled={isSubmitting}>
                    Create Device
                </Button>
            </div>

            {createDeviceMutation.isError && <p className="text-md mt-2 text-center text-red-500">An error occurred</p>}
        </form>
    );
};

DeviceCreatePage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default DeviceCreatePage;
