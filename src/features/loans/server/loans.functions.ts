import { createServerFn } from "@tanstack/react-start";
import {
	cancelLoanSchema,
	createLoanSchema,
	loanIdSchema,
} from "../schemas/loans.schemas";
import {
	cancelLoan,
	createLoan,
	getLoanById,
	getLoans,
	getReceivedLoansHistory,
	getSentLoansHistory,
} from "./loans.service.server";

export const getLoansFn = createServerFn({
	method: "GET",
}).handler(() => getLoans());

export const getLoanByIdFn = createServerFn({
	method: "GET",
})
	.validator(loanIdSchema)
	.handler(({ data }) => getLoanById(data.loanId));

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

export const cancelLoanFn = createServerFn({
	method: "POST",
})
	.validator(cancelLoanSchema)
	.handler(({ data }) => cancelLoan(data));
