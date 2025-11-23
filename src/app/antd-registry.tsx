"use client";

import {
	StyleProvider,
	createCache,
	extractStyle,
} from "@ant-design/cssinjs";
import { ConfigProvider, theme as antdTheme } from "antd";
import type { ThemeConfig } from "antd/es/config-provider";
import { useServerInsertedHTML } from "next/navigation";
import {
	PropsWithChildren,
	createContext,
	startTransition,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	PREFER_DARK_QUERY,
	THEME_STORAGE_KEY,
	type ThemeMode,
} from "../lib/theme";

type ThemeContextValue = {
	mode: ThemeMode;
	setTheme: (mode: ThemeMode) => void;
	isReady: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
	mode: "light",
	setTheme: () => undefined,
	isReady: false,
});

const buildThemeConfig = (mode: ThemeMode): ThemeConfig => ({
	algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
	token: {
		fontFamily: "var(--font-geist-sans), 'Inter', system-ui, sans-serif",
	},
});

export const useThemeMode = () => useContext(ThemeContext);

export default function AntdRegistry({
	children,
}: PropsWithChildren) {
	const cache = useMemo(() => createCache(), []);
	const [hydrated, setHydrated] = useState(false);
	const [mode, setMode] = useState<ThemeMode>("light");
	const [resolved, setResolved] = useState(false);
	const [shouldPersist, setShouldPersist] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}
		const persisted = window.localStorage.getItem(THEME_STORAGE_KEY);
		if (persisted === "light" || persisted === "dark") {
			startTransition(() => {
				setMode(persisted);
				setShouldPersist(true);
				setResolved(true);
			});
		} else {
			const prefersDark =
				window.matchMedia?.(PREFER_DARK_QUERY).matches ?? false;
			startTransition(() => {
				setMode(prefersDark ? "dark" : "light");
				setResolved(true);
			});
		}
	}, []);

	useEffect(() => {
		if (!resolved) {
			return;
		}
		const frame = requestAnimationFrame(() => setHydrated(true));
		return () => cancelAnimationFrame(frame);
	}, [resolved]);

	useEffect(() => {
		if (!resolved || typeof document === "undefined") {
			return;
		}
		document.documentElement.dataset.theme = mode;
		if (shouldPersist && typeof window !== "undefined") {
			window.localStorage.setItem(THEME_STORAGE_KEY, mode);
		}
	}, [mode, resolved, shouldPersist]);

	// Disabled for Cloudflare Workers compatibility
	// The SSR style extraction causes issues with streaming on edge runtime
	// Ant Design styles will load client-side instead
	// useServerInsertedHTML(() => (
	// 	<style
	// 		id="antd"
	// 		dangerouslySetInnerHTML={{
	// 			__html: extractStyle(cache, true),
	// 		}}
	// 	/>
	// ));

	const themeConfig = useMemo(() => buildThemeConfig(mode), [mode]);
	const handleSetTheme = useCallback((value: ThemeMode) => {
		setMode(value);
		setShouldPersist(true);
	}, []);
	const contextValue = useMemo(
		() => ({
			mode,
			setTheme: handleSetTheme,
			isReady: resolved,
		}),
		[mode, resolved, handleSetTheme],
	);

	return (
		<ThemeContext.Provider value={contextValue}>
			<StyleProvider cache={cache}>
				<ConfigProvider theme={themeConfig}>
					<div
						className={
							hydrated
								? "app-shell app-shell--visible"
								: "app-shell app-shell--hidden"
						}
					>
						{children}
					</div>
				</ConfigProvider>
			</StyleProvider>
		</ThemeContext.Provider>
	);
}
