import { Error } from "@/components/Error";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { DeviceEditForm } from "./DeviceEditForm";

type DeviceEditProps = {
    id: string;
};

export const DeviceEdit = ({ id }: DeviceEditProps) => {
    const deviceQuery = trpc.device.getById.useQuery({ id });

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

    return <DeviceEditForm device={deviceQuery.data} />;
};
