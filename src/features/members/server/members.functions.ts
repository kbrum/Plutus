import { createServerFn } from "@tanstack/react-start";
import { updateMemberNameSchema } from "../schemas/members.schemas";
import { getMembers, updateMemberName } from "./members.service.server";

export const getMembersFn = createServerFn({
	method: "GET",
}).handler(() => getMembers());

export const updateMemberNameFn = createServerFn({
	method: "POST",
})
	.validator(updateMemberNameSchema)
	.handler(({ data }) => updateMemberName(data.name));
