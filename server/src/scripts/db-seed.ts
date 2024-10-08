import "dotenv/config";
import { serverEnv } from "@/env/server";
import { hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const run = async () => {
    const email = "sokoma25@osu.cz";

    const password = await hash(email, serverEnv.BCRYPT_SALT_ROUNDS);

    await prisma.user.createMany({
        data: [
            {
                name: "Marek Sokol",
                email,
                password: password,
            },
        ],
        skipDuplicates: true,
    });
};

run()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
