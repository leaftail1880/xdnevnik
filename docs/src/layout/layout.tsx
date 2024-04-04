import { Suspense } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { Outlet } from "react-router-dom";
import NotFoundPage from "../sections/404";
import Client from "../client";
import Footer from "./footer";
import HeadMeta from "./head-meta";
import Header from "./header";

function OnError(props: FallbackProps) {
	return (
		<div>
			Произошла ошибка
			<br />
			{props.error}
		</div>
	);
}

function Layout() {
	return (
		<>
			<ErrorBoundary fallbackRender={OnError}>
				<HeadMeta />
				<Header />
				<Router />
				<Footer />
				<Client />
			</ErrorBoundary>
		</>
	);
}

function Router() {
	try {
		return (
			<ErrorBoundary fallbackRender={OnError}>
				<Suspense>
					<Outlet />
				</Suspense>
			</ErrorBoundary>
		);
	} catch (e) {
		console.error(e);
		return <NotFoundPage />;
	}
}

export default Layout;
