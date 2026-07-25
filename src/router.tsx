import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { GlobalErrorPage } from "./features/system/pages/GlobalErrorPage";
import { GlobalPendingPage } from "./features/system/pages/GlobalPendingPage";
import { NotFoundPage } from "./features/system/pages/NotFoundPage";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const context = getContext();

	const router = createTanStackRouter({
		routeTree,
		context,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultPendingComponent: GlobalPendingPage,
		defaultPendingMs: 250,
		defaultPendingMinMs: 300,
		defaultErrorComponent: GlobalErrorPage,
		defaultNotFoundComponent: NotFoundPage,
		notFoundMode: "root",
	});

	setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
