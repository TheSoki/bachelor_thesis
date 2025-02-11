import { DefaultLayout } from "./DefaultLayout";
import { match } from "ts-pattern";
import { Skeleton } from "@/client/shadcn/ui/skeleton";
import type { ReactNode } from "react";
import { FullscreenError } from "@/client/components/FullscreenError";
import { useAuth } from "@/client/hooks/useAuth";

type AuthLayoutProps = {
    children: ReactNode;
};

export const AuthLayout = ({ children }: AuthLayoutProps) => {
    const { session } = useAuth();

    return (
        <DefaultLayout>
            {match(session)
                .with(
                    {
                        status: "loading",
                    },
                    () => (
                        <>
                            {[...Array(10)].map((_, i) => (
                                <Skeleton className="mb-2 h-10" key={`auth-layout-skeleton-${i}`} />
                            ))}
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
                    <FullscreenError statusCode={401} title="Unauthorized" />
                ))}
        </DefaultLayout>
    );
};
