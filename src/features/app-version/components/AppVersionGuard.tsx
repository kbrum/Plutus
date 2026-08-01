import { RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";

const VERSION_CHECK_INTERVAL_MS = 15_000;

type AppVersionGuardProps = {
	initialVersion: string;
	children: React.ReactNode;
};

export function AppVersionGuard({
	initialVersion,
	children,
}: AppVersionGuardProps) {
	const loadedVersion = useRef(initialVersion);
	const checkInFlight = useRef(false);
	const updateRequiredRef = useRef(false);
	const [updateRequired, setUpdateRequired] = useState(false);

	useEffect(() => {
		let active = true;

		async function checkForUpdate() {
			if (
				checkInFlight.current ||
				updateRequiredRef.current ||
				document.visibilityState !== "visible"
			) {
				return;
			}

			checkInFlight.current = true;
			try {
				const response = await fetch(`/api/version?t=${Date.now()}`, {
					cache: "no-store",
					headers: { Accept: "application/json" },
				});
				if (!response.ok) {
					return;
				}

				const data: unknown = await response.json();
				const currentVersion =
					data && typeof data === "object" && "version" in data
						? data.version
						: null;

				if (
					active &&
					typeof currentVersion === "string" &&
					currentVersion !== loadedVersion.current
				) {
					updateRequiredRef.current = true;
					setUpdateRequired(true);
				}
			} catch {
				// A temporary network failure must not interrupt the current session.
			} finally {
				checkInFlight.current = false;
			}
		}

		const interval = window.setInterval(
			() => void checkForUpdate(),
			VERSION_CHECK_INTERVAL_MS,
		);
		const checkWhenActive = () => {
			if (document.visibilityState === "visible") {
				void checkForUpdate();
			}
		};

		window.addEventListener("focus", checkWhenActive);
		window.addEventListener("online", checkWhenActive);
		document.addEventListener("visibilitychange", checkWhenActive);

		return () => {
			active = false;
			window.clearInterval(interval);
			window.removeEventListener("focus", checkWhenActive);
			window.removeEventListener("online", checkWhenActive);
			document.removeEventListener("visibilitychange", checkWhenActive);
		};
	}, []);

	if (!updateRequired) {
		return children;
	}

	return (
		<Dialog open>
			<DialogContent
				showCloseButton={false}
				className="z-[100] max-w-[calc(100%-2rem)] border-slate-800 bg-popover text-slate-100 sm:max-w-md"
				onEscapeKeyDown={(event) => event.preventDefault()}
				onInteractOutside={(event) => event.preventDefault()}
			>
				<DialogHeader className="text-left">
					<div className="mb-2 flex size-11 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10 text-amber-300">
						<RefreshCw className="size-5" />
					</div>
					<DialogTitle className="text-xl tracking-[-0.02em]">
						Nova versão disponível
					</DialogTitle>
					<DialogDescription className="leading-6 text-slate-400">
						Uma nova versão do Plutus está disponível. Recarregue a página para
						continuar usando o sistema.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						className="w-full rounded-xl bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
						onClick={() => window.location.reload()}
					>
						<RefreshCw />
						Recarregar agora
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
