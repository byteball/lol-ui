import { Header } from "@/components/organisms";
import { Notifications } from "@/components/atoms";

export const Layout = ({ children }) => {
	return (
		<div>
			<div className="min-h-screen antialiased pb-20 bg-[url('/grid.svg')]">
				<div className="bg-gradient-to-b from-[#0281EB]/30 to-transparent">
					<div className="container pb-[180px] mx-auto">
						<Header />
					</div>
				</div>

				<div className="container pl-3 pr-3 mx-auto">
					<div className="mt-[-170px]">{children}</div>
				</div>
				<Notifications />
			</div>
			<div className="text-center text-white/60 mt-[-30px] pb-2 font-light">
				<a href="https://obyte.org">
					&copy; {new Date().getFullYear()} Obyte. All Rights Reserved.
				</a>
			</div>
		</div>
	);
};
