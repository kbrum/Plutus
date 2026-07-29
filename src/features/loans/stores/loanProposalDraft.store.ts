import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CreateLoanProposalSchema } from "../schemas/loans.proposals.schemas";

type LoanProposalDraftState = {
	ownerId?: string;
	drafts: Record<string, CreateLoanProposalSchema>;
	setOwner: (ownerId: string) => void;
	saveDraft: (draft: CreateLoanProposalSchema) => void;
	removeDraft: (
		loanRequestId: string,
		parentProposalId?: string | null,
	) => void;
};

export function getLoanProposalDraftKey(
	loanRequestId: string,
	parentProposalId?: string | null,
) {
	return `${loanRequestId}:${parentProposalId ?? "initial"}`;
}

export const useLoanProposalDraftStore = create<LoanProposalDraftState>()(
	persist(
		(set) => ({
			drafts: {},
			setOwner: (ownerId) =>
				set((state) =>
					state.ownerId === ownerId ? state : { ownerId, drafts: {} },
				),
			saveDraft: (draft) =>
				set((state) => ({
					drafts: {
						...state.drafts,
						[getLoanProposalDraftKey(
							draft.loanRequestId,
							draft.parentProposalId,
						)]: draft,
					},
				})),
			removeDraft: (loanRequestId, parentProposalId) =>
				set((state) => {
					const drafts = { ...state.drafts };
					delete drafts[
						getLoanProposalDraftKey(loanRequestId, parentProposalId)
					];
					return { drafts };
				}),
		}),
		{
			name: "plutus-loan-proposal-drafts",
			storage: createJSONStorage(() => localStorage),
			skipHydration: true,
			partialize: (state) => ({
				ownerId: state.ownerId,
				drafts: state.drafts,
			}),
		},
	),
);
