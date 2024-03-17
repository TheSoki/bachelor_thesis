import type { NextPage } from "next";
import type { AppType, AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";

import { trpc } from "@/utils/trpc";
import { DefaultLayout } from "@/components/layouts/DefaultLayout";
import "@/styles/globals.css";

export type NextPageWithLayout<TProps = Record<string, unknown>, TInitialProps = TProps> = NextPage<
    TProps,
    TInitialProps
> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

const App = (({ Component, pageProps }: AppPropsWithLayout) => {
    const getLayout = Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

    return getLayout(<Component {...pageProps} />);
}) as AppType;

export default trpc.withTRPC(App);
