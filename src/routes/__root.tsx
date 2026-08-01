import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	ScriptOnce,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "#/components/ui/sonner";
import { AppVersionGuard } from "#/features/app-version/components/AppVersionGuard";
import { getAppVersionFn } from "#/features/app-version/server/app-version.functions";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

const themeScript = `(function(){try{var theme=localStorage.getItem('plutus-theme');var dark=theme==='dark';document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light';var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',dark?'#17221d':'#f3f1e8')}catch(e){}})();`;

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	loader: () => getAppVersionFn(),
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Plutus — Gestão de crédito",
			},
			{
				name: "theme-color",
				content: "#f3f1e8",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	const initialVersion = Route.useLoaderData();

	return (
		<AppVersionGuard initialVersion={initialVersion}>
			<Outlet />
		</AppVersionGuard>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ScriptOnce>{themeScript}</ScriptOnce>
				{children}
				<Toaster position="top-right" richColors />
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
