import type { NextPageWithLayout } from "./_app";
import { FullscreenError } from "@/client/components/FullscreenError";

const Custom404: NextPageWithLayout = () => {
    return <FullscreenError statusCode={404} title="Page not found" />;
};

export default Custom404;
