import cn from "classnames";

export const Checkbox = ({
	checked = false,
	label = "",
	description,
	onChange,
	className = "",
}) => {
	const labelKey = label ? label.trim() : className;

	return (
		<div className={cn("relative flex items-start", className)}>
			<div className="flex items-center h-6">
				<input
					id={labelKey}
					name={labelKey}
					checked={checked}
					onChange={onChange}
					type="checkbox"
					className="w-4 h-4 border-gray-300 rounded cursor-pointer text-primary focus:ring-primary"
				/>
			</div>
			<div className="ml-3 text-sm leading-6">
				{label && (
					<label
						htmlFor={labelKey}
						className="font-medium cursor-pointer text-primary/50"
					>
						{label}
					</label>
				)}{" "}
				{!!description && (
					<span id="comments-description" className="text-gray-400/50">
						{description}
					</span>
				)}
			</div>
		</div>
	);
};
