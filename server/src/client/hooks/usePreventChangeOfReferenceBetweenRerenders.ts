import { useEffect, useRef } from "react";

export const usePreventChangeOfReferenceBetweenRerenders = <V>(value: V, errorMessage: string): V => {
    const previousValueRef = useRef(value);

    useEffect(() => {
        if (previousValueRef.current !== value) {
            throw new Error(errorMessage);
        }
    }, [errorMessage, value]);

    return value;
};
