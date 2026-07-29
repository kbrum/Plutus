import { createServerFn } from "@tanstack/react-start";
import { getDashboard } from "./dashboard.service.server";

export const getDashboardFn = createServerFn({
	method: "GET",
}).handler(() => getDashboard());
