import Head from "next/head";
import Image from "next/image";
import type { FC, ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const DefaultLayout: FC<{
    children: ReactNode;
}> = ({ children }) => (
    <>
        <Head>
            <title>Prisma Starter</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <header className={`${inter.className} flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8`}>
            <Image src="/schedule.png" alt="Prisma" className="h-8 w-8" width={32} height={32} />
            <h1>University of Ostrava e-Schedule</h1>
        </header>

        <main className={`${inter.className} mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}>{children}</main>
    </>
);
