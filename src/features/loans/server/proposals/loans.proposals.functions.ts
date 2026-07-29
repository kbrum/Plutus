import { createServerFn } from "@tanstack/react-start";
import {
	createLoanProposalSchema,
	loanProposalIdSchema,
	loanProposalRequestIdSchema,
} from "../../schemas/loans.proposals.schemas";
import {
	acceptLoanProposal,
	createLoanProposal,
	getLoanProposalTimeline,
	getReceivedLoanProposals,
	getReceivedLoanProposalsHistory,
	getSentLoanProposals,
	getSentLoanProposalsHistory,
	rejectLoanProposal,
	withdrawLoanProposal,
} from "./loans.proposals.service.server";

export const getSentLoanProposalsFn = createServerFn({
	method: "GET",
}).handler(() => getSentLoanProposals());

export const getReceivedLoanProposalsFn = createServerFn({
	method: "GET",
}).handler(() => getReceivedLoanProposals());

export const getSentLoanProposalsHistoryFn = createServerFn({
	method: "GET",
}).handler(() => getSentLoanProposalsHistory());

export const getReceivedLoanProposalsHistoryFn = createServerFn({
	method: "GET",
}).handler(() => getReceivedLoanProposalsHistory());

export const getLoanProposalTimelineFn = createServerFn({
	method: "GET",
})
	.validator(loanProposalRequestIdSchema)
	.handler(({ data }) => getLoanProposalTimeline(data.loanRequestId));

export const createLoanProposalFn = createServerFn({
	method: "POST",
})
	.validator(createLoanProposalSchema)
	.handler(({ data }) => createLoanProposal(data));

export const withdrawLoanProposalFn = createServerFn({
	method: "POST",
})
	.validator(loanProposalIdSchema)
	.handler(({ data }) => withdrawLoanProposal(data.proposalId));

export const rejectLoanProposalFn = createServerFn({
	method: "POST",
})
	.validator(loanProposalIdSchema)
	.handler(({ data }) => rejectLoanProposal(data.proposalId));

export const acceptLoanProposalFn = createServerFn({
	method: "POST",
})
	.validator(loanProposalIdSchema)
	.handler(({ data }) => acceptLoanProposal(data.proposalId));
