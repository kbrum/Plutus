import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { currentUserQueryOptions } from "#/features/auth/hooks/useGetUser";
import { AppSidebar } from "#/features/navigation/components/AppSidebar";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.ensureQueryData(
			currentUserQueryOptions,
		);

		if (!user) {
			throw redirect({
				to: "/auth/login",
			});
		}

		return { user };
	},

	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	return (
		<div className="flex min-h-svh bg-background text-foreground">
			<a
				href="#main-content"
				className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform focus:translate-y-0"
			>
				Ir para o conteúdo
			</a>
			<AppSidebar />
			<main
				id="main-content"
				className="min-w-0 flex-1 overflow-x-hidden pt-16 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pt-0 lg:pb-0"
			>
				<Outlet />
			</main>
		</div>
	);
}
