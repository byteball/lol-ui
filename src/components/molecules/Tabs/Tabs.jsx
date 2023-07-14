import { Children, cloneElement } from "react";
import cn from "classnames";

const Tabs = ({ children, onChange, value }) => (
	<div className="mb-4">
		<nav className="flex space-x-3 rounded-xl" aria-label="Tabs">
			{Children.toArray(children).map((tab, i) => (
				<div key={String(tab.props.value)}>
					{cloneElement(tab, {
						current: tab.props.value === value,
						onChange,
					})}
				</div>
			))}
		</nav>
	</div>
);
// bg-fill-primary bg-primary/5 border-primary/20
const Item = ({ children, value, current, onChange }) => (
	<div
		key={value}
		onClick={() => onChange(value)}
		className={cn(
			{ "bg-primary/20": current },
			{ "hover:bg-primary/10": !current },
			"px-4 rounded-xl py-2 text-sm text-white/80 text-center cursor-pointer font-medium"
		)}
	>
		{children}
	</div>
);

Tabs.Item = Item;

export default Tabs;
