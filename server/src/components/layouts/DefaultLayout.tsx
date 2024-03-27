import { Button } from "@/shadcn/ui/button";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { signIn, signOut, useSession } from "next-auth/react";
import { Inter } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import type { FC, ReactNode } from "react";
import { match } from "ts-pattern";

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
                className={`${inter.className} flex flex-col items-center justify-between space-x-4 px-4 py-4 sm:px-6 lg:flex-row lg:px-8`}
            >
                <Link href="/" className="flex items-center space-x-2">
                    <Image src="/schedule.png" alt="Logo" className="h-8 w-8" width={32} height={32} />
                    <h1>OSU e-Schedule</h1>
                </Link>

                <div>
                    {match(session)
                        .with(
                            {
                                status: "loading",
                            },
                            () => <Skeleton className="h-10" />,
                        )
                        .with(
                            {
                                status: "authenticated",
                            },
                            ({ data }) => (
                                <div className="flex flex-col items-center space-x-4 lg:flex-row">
                                    <Link href="/users">Users</Link>
                                    <Link href="/devices">Devices</Link>

                                    <Link href={`/users/${data.user.id}`}>({data.user.name})</Link>
                                    <Button onClick={() => signOut()}>Sign Out</Button>
                                </div>
                            ),
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
