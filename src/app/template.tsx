import AuthGuard from "@/components/AuthGuard";
import { ReactNode } from "react";

type TemplateProps = {
	children: ReactNode;
};

export default function Template({ children }: TemplateProps) {
	return <AuthGuard>{children}</AuthGuard>;
}

