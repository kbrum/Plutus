import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getCurrentUserFn } from "#/features/auth/server/auth.functions";

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
	return <Outlet />;
}
