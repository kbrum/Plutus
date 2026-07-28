import { createFileRoute } from "@tanstack/react-router";
import { RequestsPage } from "#/features/loans/pages/RequestsPage";

export const Route = createFileRoute("/_authenticated/requests/")({
	component: RequestsPage,
});
