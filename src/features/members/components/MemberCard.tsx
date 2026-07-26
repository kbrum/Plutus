import { Banknote, UserRound } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";

type MemberCardProps = {
	name: string;
};

export function MemberCard({ name }: MemberCardProps) {
	return (
		<li className="group flex items-center gap-4 rounded-2xl border border-slate-800/90 bg-[#0c141e] p-4 transition-colors hover:border-slate-700 hover:bg-[#0e1823]">
			<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-teal-300/15 bg-teal-400/8 text-teal-300">
				<UserRound className="size-5" />
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-slate-100">{name}</p>
				<p className="mt-0.5 text-xs text-slate-600">Membro Plutus</p>
			</div>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						variant="outline"
						size="icon"
						aria-label={`Fazer solicitação de empréstimo para ${name}`}
						className="size-10 rounded-xl border-slate-700/80 bg-slate-900/60 text-slate-500 shadow-none hover:!border-emerald-400/30 hover:!bg-emerald-400/10 hover:!text-emerald-300"
					>
						<Banknote className="size-[1.1rem]" />
					</Button>
				</TooltipTrigger>
				<TooltipContent
					side="top"
					sideOffset={8}
					className="border border-emerald-300/15 bg-[#111d1b] text-emerald-100"
				>
					Fazer solicitação de empréstimo
				</TooltipContent>
			</Tooltip>
		</li>
	);
}
