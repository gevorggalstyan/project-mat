import { getUserIdentity } from "@/lib/auth";
import AccessDenied from "./AccessDenied";
import { ReactNode } from "react";

type AuthGuardProps = {
	children: ReactNode;
};

export default async function AuthGuard({ children }: AuthGuardProps) {
	const user = await getUserIdentity();

	if (!user) {
		return <AccessDenied />;
	}

	return <>{children}</>;
}

