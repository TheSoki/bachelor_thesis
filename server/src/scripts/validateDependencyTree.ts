import { initLogger } from "@/server/logger";
import { parseCircular, parseDependencyTree, prettyCircular } from "dpdm";

const validateDependencyTree = async () => {
    const logger = initLogger();
    try {
        const depsTree = await parseDependencyTree("src/pages", {
            extensions: [".ts", ".tsx", ".json"],
            exclude: /node_modules/,
        });

        const circulars = parseCircular(depsTree);

        if (circulars.length) {
            logger.info(`The following circular dependecies detected: ${prettyCircular(circulars)}`);
            process.exit(1);
        } else {
            logger.info(`No circular dependecies detected`);
            process.exit(0);
        }
    } catch (err) {
        logger.error(err);
    }
};

validateDependencyTree();
