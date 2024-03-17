import Link from "next/link";
import type { NextPageWithLayout } from "./_app";

const Custom404: NextPageWithLayout = () => {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <h2 className="text-9xl font-bold">404</h2>
            <h3 className="text-4xl font-bold">Page not found</h3>

            <Link href="/" className="text-gray-300 underline">
                Home
            </Link>
        </div>
    );
};

export default Custom404;
