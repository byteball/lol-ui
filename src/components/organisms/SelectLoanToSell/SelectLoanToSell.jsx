import { Children, Fragment, cloneElement } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { formatUnits } from "ethers";
import cn from "classnames";

import { QuestionTooltip } from "@/components/molecules";

import { toLocalString } from "@/utils";

const SelectLoanToSell = ({
	label,
	walletAddress,
	children,
	value,
	onChange,
	className,
	selectedOrder = {},
	labelDescription = "",
}) => (
	<Listbox value={value} onChange={onChange}>
		{({ open }) => (
			<>
				{label !== undefined && (
					<Listbox.Label className="block text-sm font-medium leading-none text-white/60">
						<div className="block mb-1 text-sm font-medium leading-none text-white/60">
							{label}{" "}
							{labelDescription && (
								<QuestionTooltip
									description={<span>{labelDescription}</span>}
								/>
							)}
						</div>
					</Listbox.Label>
				)}

				<div className={cn("relative mt-2", className)}>
					<Listbox.Button className="relative w-full px-4 py-3 pr-8 text-left text-gray-300 rounded-md shadow-sm cursor-default ring-1 ring-inset ring-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm sm:leading-6 border-primary/20 bg-primary/10">
						<div>
							{value ? (
								<div className="relative flex flex-wrap basis-full">
									<div className="basis-2/4">
										<div className={cn("text-xs font-light")}>Collateral</div>
										<div className={cn("font-semibold text-white text-sm")}>
											{toLocalString(
												(+formatUnits(value.collateral_amount, 18)).toFixed(7)
											)}{" "}
											<small>LINE</small>
										</div>
									</div>

									<div className="basis-2/4">
										<div className={cn("text-xs font-light")}>Strike price</div>
										<div className={cn("font-semibold text-white text-sm")}>
											{toLocalString(Number(value.loanStrikePrice).toFixed(7))}{" "}
											<small>LINE</small>
										</div>
									</div>

									<div className="mt-1 text-sm basic-full">
										You get:{" "}
										<span className="font-semibold text-white">
											{toLocalString(value.price.toFixed(7))} LINE
										</span>
									</div>
								</div>
							) : (
								<div className="text-white/60">Select your loan to sell</div>
							)}

							<span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
								<ChevronUpDownIcon
									className="w-5 h-5 text-gray-400"
									aria-hidden="true"
								/>
							</span>
						</div>
					</Listbox.Button>

					<Transition
						show={open}
						as={Fragment}
						leave="transition ease-in duration-100"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<Listbox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base rounded-md shadow-lg bg-gray-950 max-h-60 ring-1 ring-primary/20 ring-opacity-5 focus:outline-none sm:text-sm">
							{Children.toArray(children).length === 0 && walletAddress && (
								<Listbox.Option
									disabled
									className="py-2 pl-3 cursor-not-allowed pr-9 text-white/60"
								>
									You don't have any loans
								</Listbox.Option>
							)}
							{!walletAddress && (
								<Listbox.Option
									disabled
									className="py-2 pl-3 cursor-not-allowed pr-9 text-white/60"
								>
									Please login to see your orders
								</Listbox.Option>
							)}

							{Children.toArray(children)
								.map((item, i) => {
									return (
										<>
											{cloneElement(item, {
												disabled:
													selectedOrder.strike_price >
														item.props.value.loanStrikePrice ||
													selectedOrder.amount < item.props.value.price,
											})}
										</>
									);
								})
								.sort(
									(a, b) =>
										Number(a.props.children.props.disabled) -
										Number(b.props.children.props.disabled)
								)}
						</Listbox.Options>
					</Transition>
				</div>
			</>
		)}
	</Listbox>
);

const Option = ({ value, disabled = false }) => (
	<Listbox.Option
		disabled={disabled}
		className={({ active }) =>
			cn(
				active ? "bg-primary/30 text-white" : "text-white",
				"relative cursor-default select-none border-b-1 border-white"
			)
		}
		value={value}
	>
		{({ selected, active }) => (
			<>
				<div
					className={cn(
						"relative flex flex-wrap mb-2 basis-full px-4 py-3 pr-8",
						disabled
							? "cursor-not-allowed opacity-40 text-white/30"
							: "cursor-pointer"
					)}
				>
					<div className="basis-1/2">
						<div className={cn("text-xs font-light")}>Collateral</div>
						<div
							className={cn(
								"text-sm font-semibold",
								disabled ? "font-normal" : "text-white"
							)}
						>
							{toLocalString(
								(+formatUnits(value.collateral_amount, 18)).toFixed(7)
							)}{" "}
							<small>LINE</small>
						</div>
					</div>

					<div className="basis-1/2">
						<div className="text-xs font-light">Strike price</div>
						<div
							className={cn(
								"text-sm font-semibold ",
								disabled ? "font-normal" : "text-white"
							)}
						>
							{toLocalString(value.loanStrikePrice.toFixed(7))}{" "}
							<small>LINE</small>
						</div>
					</div>

					<div className="basic-full">
						You get:{" "}
						<span
							className={cn(
								"font-semibold mt-1 text-sm ",
								disabled ? "font-normal" : "text-white"
							)}
						>
							{toLocalString(value.price.toFixed(7))} LINE
						</span>
					</div>
				</div>
			</>
		)}
	</Listbox.Option>
);

SelectLoanToSell.Option = Option;
export default SelectLoanToSell;
