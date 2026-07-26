import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMembersFn } from "../server/members.functions";

export function useGetMembers() {
	const membersFn = useServerFn(getMembersFn);

	const {
		data: members,
		isError,
		isLoading,
	} = useQuery({
		queryKey: ["members"],
		queryFn: membersFn,
	});

	return {
		members,
		isError,
		isLoading,
	};
}
