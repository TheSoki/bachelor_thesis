import type { NextPageWithLayout } from "./_app";
import { Error } from "@/components/Error";

const Custom404: NextPageWithLayout = () => {
    return <Error statusCode={404} title="Page not found" />;
};

export default Custom404;
