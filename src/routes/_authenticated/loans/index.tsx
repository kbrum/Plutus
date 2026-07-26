import { createFileRoute } from "@tanstack/react-router";
import { LoansPage } from "#/features/loans/pages/LoansPage";

export const Route = createFileRoute("/_authenticated/loans/")({
	component: LoansPage,
});
