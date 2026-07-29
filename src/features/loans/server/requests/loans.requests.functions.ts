import { createServerFn } from "@tanstack/react-start";
import {
	createLoanRequestSchema,
	deleteLoanRequestSchema,
} from "../../schemas/loans.requests.schemas";
import {
	acceptLoanRequest,
	cancelLoanRequest,
	createLoanRequest,
	getAcceptedLoanRequestsAwaitingProposal,
	getAcceptedLoanRequestsAwaitingTerms,
	getReceivedLoanRequests,
	getReceivedLoanRequestsHistory,
	getSentLoanRequests,
	getSentLoansRequestsHistory,
	rejectLoanRequest,
} from "./loans.requests.service.server";

export const getSentLoanRequestsFn = createServerFn({
	method: "GET",
}).handler(() => getSentLoanRequests());

export const getReceivedLoanRequestsFn = createServerFn({
	method: "GET",
}).handler(() => getReceivedLoanRequests());

export const getAcceptedLoanRequestsAwaitingProposalFn = createServerFn({
	method: "GET",
}).handler(() => getAcceptedLoanRequestsAwaitingProposal());

export const getAcceptedLoanRequestsAwaitingTermsFn = createServerFn({
	method: "GET",
}).handler(() => getAcceptedLoanRequestsAwaitingTerms());

export const getReceivedLoanRequestsHistoryFn = createServerFn({
	method: "GET",
}).handler(() => getReceivedLoanRequestsHistory());

export const getSentLoansRequestsHistoryFn = createServerFn({
	method: "GET",
}).handler(() => getSentLoansRequestsHistory());

export const createLoanRequestFn = createServerFn({
	method: "POST",
})
	.validator(createLoanRequestSchema)
	.handler(({ data }) => createLoanRequest(data));

export const cancelLoanRequestFn = createServerFn({
	method: "POST",
})
	.validator(deleteLoanRequestSchema)
	.handler(({ data }) => cancelLoanRequest(data.requestId));

export const acceptLoanRequestFn = createServerFn({
	method: "POST",
})
	.validator(deleteLoanRequestSchema)
	.handler(({ data }) => acceptLoanRequest(data.requestId));

export const rejectLoanRequestFn = createServerFn({
	method: "POST",
})
	.validator(deleteLoanRequestSchema)
	.handler(({ data }) => rejectLoanRequest(data.requestId));
