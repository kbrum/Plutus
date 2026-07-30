import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "#/components/ui/switch";

const THEME_STORAGE_KEY = "plutus-theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
	const isDark = theme === "dark";
	document.documentElement.classList.toggle("dark", isDark);
	document.documentElement.style.colorScheme = theme;
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute("content", isDark ? "#17221d" : "#f3f1e8");
	localStorage.setItem(THEME_STORAGE_KEY, theme);
	window.dispatchEvent(
		new CustomEvent("plutus-theme-change", { detail: theme }),
	);
}

export function ThemeToggle() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		setIsDark(document.documentElement.classList.contains("dark"));
	}, []);

	return (
		<div className="flex items-center gap-2" title="Alternar tema">
			<Sun
				className={`size-4 transition-colors ${isDark ? "text-slate-600" : "text-amber-300"}`}
				aria-hidden="true"
			/>
			<Switch
				checked={isDark}
				onCheckedChange={(checked) => {
					const theme = checked ? "dark" : "light";
					setIsDark(checked);
					applyTheme(theme);
				}}
				aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
			/>
			<Moon
				className={`size-4 transition-colors ${isDark ? "text-amber-300" : "text-slate-600"}`}
				aria-hidden="true"
			/>
		</div>
	);
}
