import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { updateMemberNameFn } from "#/features/members/server/members.functions";

export function useUpdateProfileName() {
	const queryClient = useQueryClient();
	const updateNameFn = useServerFn(updateMemberNameFn);
	const mutation = useMutation({
		mutationFn: (name: string) => updateNameFn({ data: { name } }),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: ["user"],
			}),
	});

	return {
		updateName: mutation.mutateAsync,
		isLoading: mutation.isPending,
	};
}
