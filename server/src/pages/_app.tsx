import "@/styles/globals.css";
import type { NextPage } from "next";
import type { AppType, AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import { trpc } from "@/utils/trpc";
import { DefaultLayout } from "@/components/layouts/DefaultLayout";
import { SessionProvider, getSession } from "next-auth/react";
import type { Session } from "next-auth";

export type NextPageWithLayout<TProps = Record<string, unknown>, TInitialProps = TProps> = NextPage<
    TProps,
    TInitialProps
> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

const App: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
    const getLayout = Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

    return <SessionProvider session={session}>{getLayout(<Component {...pageProps} />)}</SessionProvider>;
};

App.getInitialProps = async ({ ctx }) => {
    return {
        session: await getSession(ctx),
    };
};

export default trpc.withTRPC(App);
