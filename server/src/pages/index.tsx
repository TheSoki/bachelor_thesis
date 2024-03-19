import type { NextPageWithLayout } from "./_app";
import { signIn, signOut, useSession } from "next-auth/react";

const Home: NextPageWithLayout = () => {
    const session = useSession();

    if (session.status === "loading") {
        return <></>;
    }

    if (!session.data?.user) {
        return (
            <div className="flex w-full justify-between rounded bg-gray-800 px-3 py-2 text-lg text-gray-200">
                <p className="font-bold">
                    You have to{" "}
                    <button className="inline font-bold underline" onClick={() => signIn()}>
                        sign in
                    </button>{" "}
                    to write.
                </p>
                <button onClick={() => signIn()} className="h-full rounded bg-indigo-500 px-4">
                    Sign In
                </button>
            </div>
        );
    }

    return (
        <div className="flex w-full justify-between rounded bg-gray-800 px-3 py-2 text-lg text-gray-200">
            <p className="font-bold">You are signed in as {JSON.stringify(session.data.user)}</p>
            <button onClick={() => signOut()} className="h-full rounded bg-indigo-500 px-4">
                Sign Out
            </button>
        </div>
    );
};

export default Home;
