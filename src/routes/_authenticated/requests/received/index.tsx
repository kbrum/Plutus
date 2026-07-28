import { createFileRoute } from "@tanstack/react-router";
import { ReceivedRequestsPage } from "#/features/loans/pages/ReceivedRequestsPage";

export const Route = createFileRoute("/_authenticated/requests/received/")({
	component: ReceivedRequestsPage,
});
