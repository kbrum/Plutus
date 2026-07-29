import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/proposals/")({
	beforeLoad: () => {
		throw redirect({ to: "/loans" });
	},
});
