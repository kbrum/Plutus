import { createServerFn } from "@tanstack/react-start";
import { createLoanSchema } from "../schemas/loans.schemas";
import {
	createLoan,
	getLoans,
	getReceivedLoansHistory,
	getSentLoansHistory,
} from "./loans.service.server";

export const getLoansFn = createServerFn({
	method: "GET",
}).handler(() => getLoans());

export const getSentLoansHistoryFn = createServerFn({
	method: "GET",
}).handler(() => getSentLoansHistory());

export const getReceivedLoansHistoryFn = createServerFn({
	method: "GET",
}).handler(() => getReceivedLoansHistory());

export const createLoanFn = createServerFn({
	method: "POST",
})
	.validator(createLoanSchema)
	.handler(() => createLoan());
