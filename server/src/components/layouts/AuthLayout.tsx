import { DefaultLayout } from "./DefaultLayout";
import { useSession } from "next-auth/react";
import { match } from "ts-pattern";
import { Skeleton } from "@/shadcn/ui/skeleton";
import type { ReactNode } from "react";
import { Error } from "../Error";

type AuthLayoutProps = {
    children: ReactNode;
};

export const AuthLayout = ({ children }: AuthLayoutProps) => {
    const session = useSession();

    return (
        <DefaultLayout>
            {match(session)
                .with(
                    {
                        status: "loading",
                    },
                    () => (
                        <>
                            <Skeleton className="mb-2 h-10 w-1/2" />
                            <Skeleton className="mb-2 h-10 w-1/3" />
                            <Skeleton className="mb-2 h-10 w-2/4" />
                        </>
                    ),
                )
                .with(
                    {
                        status: "authenticated",
                    },
                    () => <>{children}</>,
                )
                .otherwise(() => (
                    <Error statusCode={401} title="Unauthorized" />
                ))}
        </DefaultLayout>
    );
};
