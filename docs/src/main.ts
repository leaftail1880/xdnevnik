import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./App.js";

export const createRoot = ViteReactSSG({
	routes,
});
