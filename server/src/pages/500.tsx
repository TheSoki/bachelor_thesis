import type { NextPageWithLayout } from "./_app";

const Custom500: NextPageWithLayout = () => {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <h2 className="text-9xl font-bold">500</h2>
            <h3 className="text-4xl font-bold">Server error occurred</h3>
        </div>
    );
};

export default Custom500;
