import { DefaultLayout } from "./DefaultLayout";
import { useSession } from "next-auth/react";
import { match, P } from "ts-pattern";
import { Skeleton } from "@/shadcn/ui/skeleton";
import type { FC, ReactNode } from "react";
import { Error } from "../Error";

export const AuthLayout: FC<{
    children: ReactNode;
}> = ({ children }) => {
    const session = useSession();

    return (
        <DefaultLayout>
            <>
                {match(session)
                    .with(
                        {
                            status: P.when((status) => status === "loading"),
                        },
                        () => <Skeleton className="h-10" />,
                    )
                    .with(
                        {
                            status: P.when((status) => status === "authenticated"),
                        },
                        () => <>{children}</>,
                    )
                    .otherwise(() => (
                        <Error statusCode={401} title="Unauthorized" />
                    ))}
            </>
        </DefaultLayout>
    );
};
