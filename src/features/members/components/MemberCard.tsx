import { UserRound } from "lucide-react";
import { CreateLoanRequestDialog } from "#/features/loans/components/CreateLoanRequestDialog";

type MemberCardProps = {
	id: string;
	name: string;
};

export function MemberCard({ id, name }: MemberCardProps) {
	return (
		<li className="group flex items-center gap-4 rounded-xl border border-slate-800/90 bg-card p-4 transition-colors hover:border-slate-700 hover:bg-accent/45">
			<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-teal-300/15 bg-teal-400/8 text-teal-300">
				<UserRound className="size-5" />
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-slate-100">{name}</p>
				<p className="mt-0.5 text-xs text-slate-600">Membro Plutus</p>
			</div>

			<CreateLoanRequestDialog lenderId={id} lenderName={name} />
		</li>
	);
}
