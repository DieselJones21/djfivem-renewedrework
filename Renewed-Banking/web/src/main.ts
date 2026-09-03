import App from "./App.svelte";
import { isEnvBrowser } from "./utils/misc";

if (isEnvBrowser()) {
    document.body.style.background = "#05070b";
}

const app = new App({
    target: document.body,
});

export default app;
