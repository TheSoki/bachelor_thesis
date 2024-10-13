import { trpc } from "@/utils/trpc";
import { userCreateSchema } from "@/server/schema/user";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/client/shadcn/ui/label";
import { Input } from "@/client/shadcn/ui/input";
import { Button } from "@/client/shadcn/ui/button";
import clsx from "clsx";
import { useCallback, useEffect } from "react";
import { createToast } from "@/client/utils/createToast";

type ValidationSchema = z.infer<typeof userCreateSchema>;

type UserCreateProps = {
    onCreate: () => void;
    setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
};

export const UserCreateForm = ({ onCreate, setHasUnsavedChanges }: UserCreateProps) => {
    const utils = trpc.useUtils();

    const createUserMutation = trpc.user.create.useMutation({
        async onSuccess() {
            await utils.user.list.invalidate();
            createToast("User created successfully", "success");
        },
        onError(error) {
            createToast(`Failed to create user: ${error.message}`, "error");
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
        reset,
    } = useForm<ValidationSchema>({
        resolver: zodResolver(userCreateSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    useEffect(() => {
        setHasUnsavedChanges(isDirty);
    }, [isDirty, setHasUnsavedChanges]);

    const onSubmit = useCallback(
        async (data: ValidationSchema) => {
            try {
                await createUserMutation.mutateAsync(data);
                onCreate();
                reset();
            } catch (error) {
                console.error({ error }, "Failed to create user");
            }
        },
        [createUserMutation, onCreate, reset],
    );

    return (
        <form className="mb-4 px-8 pb-8" onSubmit={handleSubmit((data) => onSubmit(data))}>
            <div className="mb-4">
                <Label htmlFor="name" className="mb-2">
                    Name
                </Label>
                <Input
                    className={clsx({
                        "border-red-500 dark:border-red-400": errors.name,
                    })}
                    id="name"
                    type="text"
                    {...register("name")}
                />
                {errors.name && (
                    <p className="mt-2 text-xs italic text-red-500 dark:text-red-400">{errors.name?.message}</p>
                )}
            </div>

            <div className="mb-4">
                <Label htmlFor="email" className="mb-2">
                    Email
                </Label>
                <Input
                    className={clsx({
                        "border-red-500 dark:border-red-400": errors.email,
                    })}
                    id="email"
                    type="email"
                    {...register("email")}
                />
                {errors.email && (
                    <p className="mt-2 text-xs italic text-red-500 dark:text-red-400">{errors.email?.message}</p>
                )}
            </div>

            <div className="mb-4">
                <Label htmlFor="password" className="mb-2">
                    Password
                </Label>
                <Input
                    className={clsx({
                        "border-red-500 dark:border-red-400": errors.password,
                    })}
                    id="password"
                    type="password"
                    {...register("password")}
                />
                {errors.password && (
                    <p className="mt-2 text-xs italic text-red-500 dark:text-red-400">{errors.password?.message}</p>
                )}
            </div>

            <div className="mb-6 text-center">
                <Button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                >
                    Create
                </Button>
            </div>
        </form>
    );
};
