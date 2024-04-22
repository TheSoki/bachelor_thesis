import Link from "next/link";

type ErrorProps = {
    statusCode: number;
    title: string;
};

export const Error = ({ statusCode, title }: ErrorProps) => (
    <div className="flex h-screen flex-col items-center justify-center">
        <h2 className="text-9xl font-bold">{statusCode}</h2>
        <h3 className="text-4xl font-bold">{title}</h3>

        <Link href="/" className="text-gray-800 underline">
            Home
        </Link>
    </div>
);
