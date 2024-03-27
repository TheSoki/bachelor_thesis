import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import { createUserSchema } from "@/server/schema/user";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import clsx from "clsx";
import { useCallback } from "react";

type ValidationSchema = z.infer<typeof createUserSchema>;

export const UserCreate = () => {
    const router = useRouter();

    const createUserMutation = trpc.user.create.useMutation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
        reset,
    } = useForm<ValidationSchema>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    const onSubmit = useCallback(
        async (data: ValidationSchema) => {
            try {
                await createUserMutation.mutateAsync(data);

                reset();
                router.push("/users");
            } catch (error) {
                console.error({ error }, "Failed to create user");
            }
        },
        [createUserMutation, reset, router],
    );

    return (
        <form className="mb-4 px-8 pb-8" onSubmit={handleSubmit((data) => onSubmit(data))}>
            <div className="mb-4">
                <Label htmlFor="name" className="mb-2">
                    Name
                </Label>
                <Input
                    className={clsx({
                        "border-red-500": errors.name,
                    })}
                    id="name"
                    type="text"
                    {...register("name")}
                />
                {errors.name && <p className="mt-2 text-xs italic text-red-500">{errors.name?.message}</p>}
            </div>

            <div className="mb-4">
                <Label htmlFor="email" className="mb-2">
                    Email
                </Label>
                <Input
                    className={clsx({
                        "border-red-500": errors.email,
                    })}
                    id="email"
                    type="email"
                    {...register("email")}
                />
                {errors.email && <p className="mt-2 text-xs italic text-red-500">{errors.email?.message}</p>}
            </div>

            <div className="mb-4">
                <Label htmlFor="password" className="mb-2">
                    Password
                </Label>
                <Input
                    className={clsx({
                        "border-red-500": errors.password,
                    })}
                    id="password"
                    type="password"
                    {...register("password")}
                />
                {errors.password && <p className="mt-2 text-xs italic text-red-500">{errors.password?.message}</p>}
            </div>

            <div className="mb-6 text-center">
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                    Create User
                </Button>
            </div>

            {createUserMutation.isError && <p className="text-md mt-2 text-center text-red-500">An error occurred</p>}
        </form>
    );
};
