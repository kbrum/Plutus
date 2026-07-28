import { createServerFn } from "@tanstack/react-start";
import { createLoanRequestSchema } from "../../schemas/loans.requests.schemas";
import {
	createLoanRequest,
	getLoanRequests,
} from "./loans.requests.service.server";

export const getLoanRequestsFn = createServerFn({
	method: "GET",
}).handler(() => getLoanRequests());

export const createLoanRequestFn = createServerFn({
	method: "POST",
})
	.validator(createLoanRequestSchema)
	.handler(({ data }) => createLoanRequest(data));
