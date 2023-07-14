import { useDispatch, useSelector } from "react-redux";
import { Transition, Menu } from "@headlessui/react";
import cn from "classnames";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

import { selectWalletAddress } from "@/store/slices/settingsSlice";
import { saveAddressAndLoadLoans } from "@/store/thunks/saveAddressAndLoadLoans";
import { logout } from "@/store/slices/settingsSlice";

import { getAccount } from "@/utils";

export const UserProfile = () => {
	const walletAddress = useSelector(selectWalletAddress);
	const dispatch = useDispatch();

	const logIn = async () => {
		const accountAddress = await getAccount();

		if (accountAddress) {
			dispatch(saveAddressAndLoadLoans(accountAddress));
		}
	};

	const logOut = () => {
		dispatch(logout());
	};

	if (!walletAddress) {
		return (
			<button
				onClick={logIn}
				className="text-sm font-semibold leading-6 text-white"
			>
				Log in <span aria-hidden="true">&rarr;</span>
			</button>
		);
	}

	const viewWallet = `${walletAddress.slice(0, 3)}...${walletAddress.slice(
		-3,
		walletAddress.length
	)}`;

	return (
		<Menu as="div" className={cn("relative inline-block")}>
			<div>
				<Menu.Button
					className={cn(
						"flex items-center space-x-2 text-sm font-semibold text-white rounded-xl focus:outline-none"
					)}
				>
					<span className="sr-only">Open menu</span>
					{viewWallet}{" "}
					<ChevronDownIcon width="1em" strokeWidth={2} height="1em" />
				</Menu.Button>
			</div>

			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu.Items className="absolute right-0 z-10 mt-2 origin-top-right rounded-md shadow-lg bg-gray-950 sm:w-36 w-26 ring-1 ring-black ring-opacity-5 focus:outline-none">
					<div className="py-1">
						<Menu.Item>
							{({ active }) => (
								<button
									type="submit"
									onClick={logOut}
									className={cn(
										active ? "bg-gray-100/10 text-white" : "text-white",
										"block px-4 py-2 text-sm w-full text-left"
									)}
								>
									Exit
								</button>
							)}
						</Menu.Item>
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	);
};
