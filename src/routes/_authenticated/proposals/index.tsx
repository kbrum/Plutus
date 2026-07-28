import { createFileRoute } from "@tanstack/react-router";
import { ProposalsPage } from "#/features/loans/pages/ProposalsPage";

export const Route = createFileRoute("/_authenticated/proposals/")({
	component: ProposalsPage,
});
