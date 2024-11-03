import "dotenv/config";
import { serverEnv } from "@/env/server";
import { hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const run = async () => {
    const email = "sokoma25@osu.cz";

    const password = await hash(email, serverEnv.BCRYPT_SALT_ROUNDS);

    const userId = "cm2qgoaiz0000sa76eporkrhb";
    const createdAt = "2024-08-31T22:00:00.000Z";

    await prisma.user.createMany({
        data: [
            {
                id: userId,
                name: "Marek Sokol",
                email,
                password: password,
                createdAt,
            },
        ],
        skipDuplicates: true,
    });

    await prisma.device.createMany({
        data: [
            {
                id: "cm2qgvdds0000vuc4exhwvxkk",
                buildingId: "C",
                roomId: "105",
                authorId: userId,
                createdAt,
            },
            {
                id: "cm2qgvddt0002vuc4ge4tgz9f",
                buildingId: "C",
                roomId: "106",
                authorId: userId,
                createdAt,
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
