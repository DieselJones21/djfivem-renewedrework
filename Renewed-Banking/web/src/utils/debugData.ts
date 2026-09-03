import {isEnvBrowser} from "./misc";

interface DebugEvent<T = any> {
    action: string;
    data: T;
}

/**
 * Emulates dispatching an event using SendNuiMessage in the lua scripts.
 * Merges payload at the top level to match FiveM SendNUIMessage.
 */
export const debugData = <P>(events: DebugEvent<P>[], timer = 400): void => {
    if (!isEnvBrowser()) return;
    for (const event of events) {
        setTimeout(() => {
            const payload = event.data && typeof event.data === "object"
                ? { action: event.action, ...(event.data as unknown as object) }
                : { action: event.action, data: event.data };
            window.dispatchEvent(new MessageEvent("message", { data: payload }));
        }, timer);
    }
};
