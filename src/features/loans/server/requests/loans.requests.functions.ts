import { createServerFn } from "@tanstack/react-start";
import {
	createLoanRequestSchema,
	deleteLoanRequestSchema,
} from "../../schemas/loans.requests.schemas";
import {
	createLoanRequest,
	deleteLoanRequest,
	getReceivedLoanRequests,
	getSentLoanRequests,
} from "./loans.requests.service.server";

export const getSentLoanRequestsFn = createServerFn({
	method: "GET",
}).handler(() => getSentLoanRequests());

export const getReceivedLoanRequestsFn = createServerFn({
	method: "GET",
}).handler(() => getReceivedLoanRequests());

export const createLoanRequestFn = createServerFn({
	method: "POST",
})
	.validator(createLoanRequestSchema)
	.handler(({ data }) => createLoanRequest(data));

export const deleteLoanRequestFn = createServerFn({
	method: "POST",
})
	.validator(deleteLoanRequestSchema)
	.handler(({ data }) => deleteLoanRequest(data.requestId));
