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
		<div className="flex min-h-svh bg-[#070c12] text-slate-100">
			<AppSidebar />
			<main className="min-w-0 flex-1 overflow-x-hidden">
				<Outlet />
			</main>
		</div>
	);
}
