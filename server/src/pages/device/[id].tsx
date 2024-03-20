import { Error } from "@/components/Error";
import { useRouter } from "next/router";
import { trpc, type RouterOutput } from "@/utils/trpc";
import type { NextPageWithLayout } from "../_app";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { updateDeviceSchema } from "@/server/schema/device";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, type FC } from "react";
import { Skeleton } from "@/shadcn/ui/skeleton";

type ValidationSchema = z.infer<typeof updateDeviceSchema>;

type DeviceByIdOutput = RouterOutput["device"]["byId"];

const DeviceViewPage: NextPageWithLayout = () => {
    const router = useRouter();
    const id = router.query.id as string | undefined;

    const deviceQuery = trpc.device.byId.useQuery(
        { id: id ?? "" },
        {
            enabled: !!id,
        },
    );

    if (deviceQuery.error) {
        return <Error title={deviceQuery.error.message} statusCode={deviceQuery.error.data?.httpStatus ?? 500} />;
    }

    if (deviceQuery.status !== "success") {
        return (
            <>
                <Skeleton className="mb-2 h-10 w-1/2" />
                <Skeleton className="mb-2 h-10 w-1/3" />
                <Skeleton className="mb-2 h-10 w-2/4" />
            </>
        );
    }

    return <DeviceForm device={deviceQuery.data} />;
};

const DeviceForm: FC<{
    device: DeviceByIdOutput;
}> = ({ device }) => {
    const utils = trpc.useUtils();

    const updateDeviceMutation = trpc.device.update.useMutation({
        async onSuccess() {
            // refetches device after a device is added
            await utils.device.byId.invalidate({
                id: device.id,
            });
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
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
                <Button type="submit" disabled={isSubmitting}>
                    Update Device
                </Button>
            </div>

            {updateDeviceMutation.isError && <p className="text-md mt-2 text-center text-red-500">An error occurred</p>}
        </form>
    );
};

DeviceViewPage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default DeviceViewPage;
