import { createFileRoute } from "@tanstack/react-router";
import { ProposalsPage } from "#/features/proposals/pages/ProposalsPage";

export const Route = createFileRoute("/_authenticated/proposals/")({
	component: ProposalsPage,
});
