"use client";

import { StyleProvider, createCache, extractStyle } from "@ant-design/cssinjs";
import { useServerInsertedHTML } from "next/navigation";
import { PropsWithChildren, useMemo } from "react";

export default function AntdRegistry({ children }: PropsWithChildren) {
	const cache = useMemo(() => createCache(), []);

	useServerInsertedHTML(() => (
		<style
			id="antd"
			dangerouslySetInnerHTML={{
				__html: extractStyle(cache, true),
			}}
		/>
	));

	return <StyleProvider cache={cache}>{children}</StyleProvider>;
}

