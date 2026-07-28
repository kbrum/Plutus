import { createFileRoute } from "@tanstack/react-router";
import { SentRequestsPage } from "#/features/loans/pages/SentRequestsPage";

export const Route = createFileRoute("/_authenticated/requests/sent/")({
	component: SentRequestsPage,
});
