import { Link } from "react-router-dom";

import { ArrowLeftIcon } from "@/components/icons";

export const PageLayout = ({ children, description, title = "No title" }) => (
	<div className="max-w-5xl p-4 mx-auto mt-8 border-2 md:p-6 lg:p-10 bg-gray-950 rounded-3xl border-primary/30">
		{/* <Link
			to="/"
			className="inline-flex items-center mb-3 space-x-2 font-medium cursor-pointer lg:mb-5"
		>
			<div>
				<ArrowLeftIcon
					className="w-[1em] h-[1em] stroke-primary"
					opacity="0.7"
				/>
			</div>
			<div className="text-primary/70">Go to main</div>
		</Link> */}

		<h1 className="mb-3 text-3xl font-bold text-gray-300 lg:mb-6 lg:text-5xl">
			{title}
		</h1>

		{!!description && (
			<h3 className="text-gray-400 text-md lg:text-lg">{description}</h3>
		)}

		<div className="mt-3 text-gray-300 lg:mt-5">{children}</div>
	</div>
);
