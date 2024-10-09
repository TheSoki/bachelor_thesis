import { useCallback, useState } from "react";
import SearchIcon from "@/client/icons/search.svg";
import { Input } from "@/client/shadcn/ui/input";
import { Button } from "@/client/shadcn/ui/button";

type SearchBarProps = {
    defaultValue: string | undefined;
    onSubmit: (value: string) => void;
};

export const SearchBar = ({ defaultValue, onSubmit }: SearchBarProps) => {
    const [value, setValue] = useState(defaultValue ?? "");

    const onChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
        },
        [setValue],
    );

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                onSubmit(value);
            }
        },
        [onSubmit, value],
    );

    const onSubmitButtonClick = useCallback(() => {
        onSubmit(value);
    }, [onSubmit, value]);

    return (
        <div className="mb-4 flex items-center gap-2">
            <Input value={value} onChange={onChange} placeholder="Search" onKeyDown={onKeyDown} autoFocus />
            <Button type="submit" onClick={onSubmitButtonClick}>
                <SearchIcon className="h-4 w-4" />
            </Button>
        </div>
    );
};
