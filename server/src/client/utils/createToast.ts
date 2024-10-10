import { Toaster, toast } from "sonner";

const createToast = (message: string, type: "success" | "error" | "warning" | "info") => {
    toast[type](message);
};

export { Toaster, createToast };
