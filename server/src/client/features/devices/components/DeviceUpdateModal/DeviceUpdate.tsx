import { trpc } from "@/utils/trpc";
import { Skeleton } from "@/client/shadcn/ui/skeleton";
import { DeviceUpdateForm } from "./DeviceUpdateForm";

type DeviceUpdateProps = {
    id: string;
    onUpdate: () => void;
};

export const DeviceUpdate = ({ id, onUpdate }: DeviceUpdateProps) => {
    const deviceQuery = trpc.device.getById.useQuery({ id });

    if (deviceQuery.error) {
        return (
            <div className="text-center">
                <h2 className="text-5xl font-bold">{deviceQuery.error.data?.httpStatus ?? 500}</h2>
                <h3 className="mb-4 text-xl font-bold">{deviceQuery.error.message}</h3>
            </div>
        );
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

    return <DeviceUpdateForm device={deviceQuery.data} onUpdate={onUpdate} />;
};
