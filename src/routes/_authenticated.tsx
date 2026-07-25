import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getCurrentUserFn } from "#/features/auth/server/auth.functions";
import { AppSidebar } from "#/features/navigation/components/AppSidebar";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async () => {
		const user = await getCurrentUserFn();

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
