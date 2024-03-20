import { Button } from "@/shadcn/ui/button";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { signIn, signOut, useSession } from "next-auth/react";
import { Inter } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
import type { FC, ReactNode } from "react";
import { match, P } from "ts-pattern";

const inter = Inter({ subsets: ["latin"] });

export const DefaultLayout: FC<{
    children: ReactNode;
}> = ({ children }) => {
    const session = useSession();

    return (
        <>
            <Head>
                <title>OSU e-Schedule</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <header
                className={`${inter.className} flex items-center justify-between space-x-4 px-4 py-4 sm:px-6 lg:px-8`}
            >
                <div className="flex items-center space-x-2">
                    <Image src="/schedule.png" alt="Logo" className="h-8 w-8" width={32} height={32} />
                    <h1>OSU e-Schedule</h1>
                </div>

                <div>
                    {match(session)
                        .with(
                            {
                                status: P.when((status) => status === "loading"),
                            },
                            () => <Skeleton className="h-10" />,
                        )
                        .with(
                            {
                                data: P.when((data) => !!data?.user),
                            },
                            ({ data }) => <Button onClick={() => signOut()}>({data?.user?.name}) Sign Out</Button>,
                        )
                        .otherwise(() => (
                            <Button onClick={() => signIn()}>Sign In</Button>
                        ))}
                </div>
            </header>

            <main className={`${inter.className} mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}>{children}</main>
        </>
    );
};
