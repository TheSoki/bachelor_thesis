import React, { useState } from "react";
import { Button } from "@/client/shadcn/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/client/shadcn/ui/sheet";
import { Menu } from "lucide-react";
import { Inter } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { NavigationLinksBar } from "./NavigationLinksBar";

const inter = Inter({ subsets: ["latin"] });

type DefaultLayoutProps = {
    children: ReactNode;
};

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => setIsOpen(false);

    return (
        <>
            <Head>
                <title>OSU e-Schedule</title>
                <link rel="icon" href="/favicon.ico" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                            document.documentElement.classList.add('dark')
                        } else {
                            document.documentElement.classList.remove('dark')
                        }
                        `,
                    }}
                />
            </Head>

            <header className={`${inter.className} flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8`}>
                <Link href="/" className="flex items-center space-x-2">
                    <Image src="/images/schedule.png" alt="Logo" className="h-8 w-8" width={32} height={32} />
                    <h1 className="text-lg font-semibold">OSU e-Schedule</h1>
                </Link>

                <nav className="hidden lg:flex lg:items-center lg:space-x-4">
                    <NavigationLinksBar onCloseMenu={closeMenu} />
                </nav>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                        <nav className="flex flex-col space-y-4 pt-4">
                            <NavigationLinksBar onLinkClick={closeMenu} onCloseMenu={closeMenu} />
                        </nav>
                    </SheetContent>
                </Sheet>
            </header>

            <main className={`${inter.className} mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}>{children}</main>
        </>
    );
};
