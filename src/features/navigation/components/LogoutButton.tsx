import { redirect } from "@tanstack/react-router";
import { LoaderCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useLogout } from "#/features/auth/hooks/useLogout";
import { itemClassName } from "./AppSidebar";

export function LogoutButton() {
	const { logout, isLoading, isError, error } = useLogout();

	const handleError = () => {
		if (isError) {
			toast.error(error?.message);
		}
	};

	const handleLogout = async () => {
		await logout();
		redirect({ to: "/auth/login" });
	};

	return (
		<button
			type="button"
			className={`${itemClassName} mt-1 text-slate-600 hover:text-red-300`}
			title="Sair"
			onClick={handleLogout}
			disabled={isLoading}
			aria-busy={isLoading}
			onError={handleError}
		>
			{isLoading ? (
				<LoaderCircle className="size-[1.1rem] animate-spin" />
			) : (
				<>
					<LogOut className="size-[1.1rem] shrink-0" />
					<span className="hidden md:block">Sair</span>
				</>
			)}
		</button>
	);
}
