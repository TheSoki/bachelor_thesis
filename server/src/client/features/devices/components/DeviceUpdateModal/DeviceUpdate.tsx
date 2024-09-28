import { FullscreenError } from "@/client/components/FullscreenError";
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
            <FullscreenError title={deviceQuery.error.message} statusCode={deviceQuery.error.data?.httpStatus ?? 500} />
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
