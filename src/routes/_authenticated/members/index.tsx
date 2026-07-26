import { createFileRoute } from "@tanstack/react-router";
import { MembersPage } from "#/features/members/pages/MembersPage";

export const Route = createFileRoute("/_authenticated/members/")({
	component: MembersPage,
});
