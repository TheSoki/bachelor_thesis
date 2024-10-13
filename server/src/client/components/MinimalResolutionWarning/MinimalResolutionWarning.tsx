import { useState, useEffect, type ReactNode } from "react";

type MinimumResolutionProps = {
    children: ReactNode;
    minWidth?: number;
};

export const MinimalResolutionWarning = ({ children, minWidth = 320 }: MinimumResolutionProps) => {
    const [isBelowMinResolution, setIsBelowMinResolution] = useState(false);

    useEffect(() => {
        const checkResolution = () => {
            setIsBelowMinResolution(window.innerWidth < minWidth);
        };

        checkResolution();
        window.addEventListener("resize", checkResolution);

        return () => {
            window.removeEventListener("resize", checkResolution);
        };
    }, [minWidth]);

    if (isBelowMinResolution) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-red-500 p-4 text-center text-white">
                <p className="text-lg font-bold">
                    Your screen width is too low. Please use a device with a wider screen.
                </p>
            </div>
        );
    }

    return children;
};
