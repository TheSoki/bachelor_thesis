import Link from "next/link";
import { useEffect } from "react";

type ErrorProps = {
    statusCode: number;
    title: string;
};

export const FullscreenError = ({ statusCode, title }: ErrorProps) => {
    useEffect(() => {
        const header = document.querySelector("header");
        if (header) {
            const height = header.offsetHeight;
            document.documentElement.style.setProperty("--header-height", `${height}px`);
        }
    }, []);

    return (
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - var(--header-height, 0px))" }}>
            <div className="text-center">
                <h2 className="text-9xl font-bold">{statusCode}</h2>
                <h3 className="mb-4 text-4xl font-bold">{title}</h3>
                <Link href="/" className="text-gray-800 underline dark:text-gray-300">
                    Home
                </Link>
            </div>
        </div>
    );
};
