import { createFileRoute } from "@tanstack/react-router";
import { LoanDetailsPage } from "#/features/loans/pages/LoanDetailsPage";

export const Route = createFileRoute("/_authenticated/loans/$loanId")({
	component: LoanDetailsRoute,
});

function LoanDetailsRoute() {
	const { loanId } = Route.useParams();

	return <LoanDetailsPage loanId={loanId} />;
}
