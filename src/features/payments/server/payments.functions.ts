import { createServerFn } from "@tanstack/react-start";
import {
	paymentFormSchema,
	paymentIdSchema,
} from "../schemas/payments.schemas";
import {
	confirmInstallmentPayment,
	getPaymentInstallments,
	getPayments,
	recordInstallmentPayment,
	rejectInstallmentPayment,
	reportInstallmentPayment,
} from "./payments.service.server";

export const getPaymentInstallmentsFn = createServerFn({
	method: "GET",
}).handler(() => getPaymentInstallments());

export const getPaymentsFn = createServerFn({ method: "GET" }).handler(() =>
	getPayments(),
);

export const reportInstallmentPaymentFn = createServerFn({ method: "POST" })
	.validator(paymentFormSchema)
	.handler(({ data }) => reportInstallmentPayment(data));

export const recordInstallmentPaymentFn = createServerFn({ method: "POST" })
	.validator(paymentFormSchema)
	.handler(({ data }) => recordInstallmentPayment(data));

export const confirmInstallmentPaymentFn = createServerFn({ method: "POST" })
	.validator(paymentIdSchema)
	.handler(({ data }) => confirmInstallmentPayment(data.paymentId));

export const rejectInstallmentPaymentFn = createServerFn({ method: "POST" })
	.validator(paymentIdSchema)
	.handler(({ data }) => rejectInstallmentPayment(data.paymentId));
