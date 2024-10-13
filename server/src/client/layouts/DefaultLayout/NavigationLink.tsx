import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import clsx from "clsx";

type NavigationLinkProps = {
    href: string;
    children: ReactNode;
    onLinkClick?: () => void;
};

export const NavigationLink = ({ href, children, onLinkClick }: NavigationLinkProps) => {
    const router = useRouter();
    const isActive = router.pathname === href;

    return (
        <Link
            href={href}
            className={clsx("block py-2 dark:text-gray-300 lg:inline-block lg:py-0", {
                "pointer-events-none text-gray-500 opacity-60 dark:text-gray-600": isActive,
            })}
            onClick={onLinkClick}
            aria-disabled={isActive}
        >
            {children}
        </Link>
    );
};
