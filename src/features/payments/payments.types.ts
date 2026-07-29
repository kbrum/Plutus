export type PaymentRole = "borrower" | "lender";

export type PaymentInstallment = {
	id: string;
	loanId: string;
	installmentNumber: number;
	totalAmount: number;
	dueDate: string;
	status: "pending" | "paid" | "overdue" | "cancelled";
	paidAt: string | null;
	role: PaymentRole;
	counterpartName: string;
	pendingPayment: {
		id: string;
		installmentNumber: number;
		amount: number;
		paidAt: string;
	} | null;
};

export type PaymentListItem = {
	id: string;
	installmentId: string;
	loanId: string;
	installmentNumber: number;
	amount: number;
	dueDate: string;
	paidAt: string;
	createdAt: string;
	confirmedAt: string | null;
	status: "reported" | "confirmed" | "rejected";
	role: PaymentRole;
	counterpartName: string;
	reportedByName: string;
};
