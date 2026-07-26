import { createFileRoute } from "@tanstack/react-router";
import { InstallmentsPage } from "#/features/installments/pages/InstallmentsPage";

export const Route = createFileRoute("/_authenticated/installments/")({
	component: InstallmentsPage,
});
