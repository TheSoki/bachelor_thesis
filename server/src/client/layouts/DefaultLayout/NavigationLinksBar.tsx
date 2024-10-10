import { AuthButton } from "./AuthButton";
import { NavigationLink } from "./NavigationLink";

type NavigationLinksBarProps = {
    onLinkClick?: () => void;
    onCloseMenu: () => void;
};

export const NavigationLinksBar = ({ onLinkClick, onCloseMenu }: NavigationLinksBarProps) => (
    <>
        <NavigationLink href="/users" onLinkClick={onLinkClick}>
            Users
        </NavigationLink>
        <NavigationLink href="/devices" onLinkClick={onLinkClick}>
            Devices
        </NavigationLink>
        <NavigationLink href="/audit-logs" onLinkClick={onLinkClick}>
            Audit Logs
        </NavigationLink>
        <AuthButton onCloseMenu={onCloseMenu} />
    </>
);
