import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import cn from "classnames";
import Tooltip from "rc-tooltip";
import { useRef } from "react";

import { QuestionTooltip } from "@/components/molecules";

export const Input = ({
	error = "",
	extra = "",
	currency,
	suffix = "",
	className = "",
	disabled = false,
	token,
	setToken,
	label = "",
	labelDescription = "",
	...rest
}) => {
	const suffixStyle =
		error && typeof error === "string" ? { marginRight: 45 } : {};
	const suffixWrapRef = useRef(null);
	const tokenSelectorWrapRef = useRef(null);
	const uniqKey = Math.random().toString(36).substr(2, 5);

	return (
		<>
			{label && (
				<label
					htmlFor={uniqKey}
					className="block mb-2 text-sm font-medium leading-none text-white/60"
				>
					{label}{" "}
					{labelDescription && (
						<QuestionTooltip description={<span>{labelDescription}</span>} />
					)}
				</label>
			)}
			<div className={cn("relative flex", className)}>
				<input
					id={uniqKey}
					{...rest}
					disabled={disabled}
					style={
						suffix && suffixWrapRef?.current
							? { paddingRight: suffixWrapRef?.current.offsetWidth + 8 }
							: token && tokenSelectorWrapRef?.current
							? { paddingRight: tokenSelectorWrapRef?.current.offsetWidth + 4 }
							: {}
					}
					className={cn(
						"block border w-full h-[45px] rounded-lg border-primary/20 bg-primary/10 text-gray-300 px-4 text-md font-normal focus:outline-none focus:ring-1 focus:border-primary/30 focus:ring-primary/30",
						{
							"border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50":
								error,
							"cursor-not-allowed bg-primary-gray-light/40 text-white/40":
								disabled,
						}
					)}
				/>
				<div
					className="absolute inset-y-0 right-0 flex items-center h-[45px]"
					ref={suffixWrapRef}
				>
					{suffix ? (
						<div
							className={cn(
								"text-white/80 truncate",
								{ "pr-1": currency },
								{ "pr-5": !currency },
								{ "pr-0": error && typeof error === "string" }
							)}
							style={suffixStyle}
						>
							{suffix}
						</div>
					) : null}

					{error && typeof error === "string" ? (
						<div className="absolute inset-y-0 right-0 flex items-center pr-3">
							<Tooltip
								placement="top"
								trigger={["hover"]}
								overlayInnerStyle={{ background: "#EF4444" }}
								overlay={<span>{error}</span>}
							>
								<ExclamationCircleIcon
									className="w-5 h-5 text-red-500"
									aria-hidden="true"
								/>
							</Tooltip>
						</div>
					) : null}
				</div>
			</div>

			{extra && !error && <p className="text-sm text-white">{extra}</p>}
		</>
	);
};
