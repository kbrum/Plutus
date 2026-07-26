import { createServerFn } from "@tanstack/react-start";
import { getMembers } from "./members.service.server";

export const getMembersFn = createServerFn({
	method: "GET",
}).handler(() => getMembers());
