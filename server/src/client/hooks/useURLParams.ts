import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { usePreventChangeOfReferenceBetweenRerenders } from "./usePreventChangeOfReferenceBetweenRerenders";

export const useURLParams = <S extends z.ZodType>(schema: S) => {
    const stableRefSchema = usePreventChangeOfReferenceBetweenRerenders(
        schema,
        "The schema cannot be changed between rerenders",
    );

    type SuccessState = {
        value: z.infer<S>;
        loading: false;
        error: null;
    };

    type LoadingState = {
        value: null;
        loading: true;
        error: null;
    };

    type ErrorState = {
        value: null;
        loading: false;
        error: string;
    };

    type URLStateType = SuccessState | LoadingState | ErrorState;

    const router = useRouter();
    const [urlState, setUrlState] = useState<URLStateType>({
        value: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const value = stableRefSchema.safeParse(router.query);

        if (value.success) {
            setUrlState({
                value: value.data,
                loading: false,
                error: null,
            });

            return;
        }

        setUrlState({
            value: null,
            loading: false,
            error: value.error.errors.join(", "),
        });
    }, [router.query, stableRefSchema]);

    const setURLParams = useCallback(
        (params: Partial<z.infer<S>>) => {
            router.replace(
                {
                    query: {
                        ...router.query,
                        ...params,
                    },
                },
                undefined,
                {
                    shallow: true,
                },
            );
        },
        [router],
    );

    return { urlState, setURLParams };
};
