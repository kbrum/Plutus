import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardFn } from "../server/dashboard.functions";

export function useDashboard() {
	const getDashboard = useServerFn(getDashboardFn);
	const query = useQuery({
		queryKey: ["dashboard"],
		queryFn: getDashboard,
	});

	return {
		dashboard: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
	};
}
