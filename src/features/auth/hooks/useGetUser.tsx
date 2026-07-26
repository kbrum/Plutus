import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCurrentUserFn } from "../server/auth.functions";

export function useGetUser() {
	const getCurrentUser = useServerFn(getCurrentUserFn);

	const {
		data: user,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["user"],
		queryFn: getCurrentUser,
		retry: true,
		staleTime: 1000 * 60 * 5,
	});

	return {
		id: user?.id,
		name: user?.profile_name,
		email: user?.email,
		isLoading,
		isError,
	};
}
