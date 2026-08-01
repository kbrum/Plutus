import { format, isValid, parseISO, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Calendar } from "#/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { cn } from "#/lib/utils";

type DatePickerProps = {
	id: string;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	"aria-describedby"?: string;
	"aria-invalid"?: boolean;
	className?: string;
};

export function DatePicker({
	id,
	value,
	onChange,
	onBlur,
	placeholder = "Selecione uma data",
	className,
	...ariaProps
}: DatePickerProps) {
	const [open, setOpen] = useState(false);
	const parsedDate = value ? parseISO(value) : undefined;
	const selectedDate =
		parsedDate && isValid(parsedDate) ? parsedDate : undefined;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					className={cn(
						"h-11 w-full justify-start rounded-xl border-slate-700 bg-slate-950/45 px-3 text-left font-medium shadow-none hover:bg-slate-900/70 hover:text-slate-100",
						!selectedDate && "text-slate-500",
						className,
					)}
					onBlur={onBlur}
					{...ariaProps}
				>
					<CalendarDays className="size-4 text-teal-300" />
					<span className="min-w-0 flex-1 truncate">
						{selectedDate
							? format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
									locale: ptBR,
								})
							: placeholder}
					</span>
					<ChevronDown className="size-4 text-slate-500" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				sideOffset={8}
				collisionPadding={8}
				aria-label="Selecionar primeiro vencimento"
				aria-describedby={`${id}-calendar-description`}
				className="max-h-[var(--radix-popover-content-available-height)] w-[min(20rem,calc(100vw-1rem))] overflow-y-auto rounded-2xl border-slate-700 bg-popover p-0 shadow-[var(--shadow-overlay)]"
			>
				<div className="border-b border-slate-800 bg-secondary/55 px-4 py-3">
					<p className="text-sm font-semibold text-slate-200">
						Primeiro vencimento
					</p>
					<p
						id={`${id}-calendar-description`}
						className="mt-0.5 text-xs text-slate-500"
					>
						Escolha quando o pagamento começa.
					</p>
				</div>
				<Calendar
					mode="single"
					locale={ptBR}
					selected={selectedDate}
					defaultMonth={selectedDate ?? startOfToday()}
					disabled={{ before: startOfToday() }}
					autoFocus
					className="mx-auto bg-transparent p-3 [--cell-size:2.5rem]"
					classNames={{
						caption_label: "font-semibold text-slate-200 capitalize",
						weekday: "text-xs font-semibold text-slate-500",
						today:
							"rounded-lg border border-teal-300/35 bg-teal-400/10 text-teal-200",
						disabled: "text-slate-600 opacity-35",
					}}
					onSelect={(date) => {
						if (!date) {
							return;
						}

						onChange(format(date, "yyyy-MM-dd"));
						setOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
