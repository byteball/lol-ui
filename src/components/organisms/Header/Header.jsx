import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, NavLink } from "react-router-dom";

import { UserProfile } from "../UserProfile/UserProfile";

const navigation = [
	{ name: "Home", href: "/" },
	{ name: "Staking", href: "/staking" },
	{ name: "Market", href: "/market" },
	{ name: "About us", href: "/about" },
	{ name: "F.A.Q.", href: "/faq" },
];

export const Header = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header>
			<nav
				className="flex items-center justify-between p-6 mx-auto max-w-7xl lg:px-8"
				aria-label="Global"
			>
				<div className="">
					<Link to="/">
						<span className="sr-only">LOL</span>

						<span className="flex items-center w-auto space-x-3 text-xl font-bold text-primary">
							<img className="w-[40px] h-[40px]" src="/logo-inv.svg" />{" "}
							<div>
								LOL{" "}
								{/* <sup>
									<small>Beta</small>
								</sup> */}
							</div>
						</span>
					</Link>
				</div>
				<div className="flex lg:hidden">
					<button
						type="button"
						className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
						onClick={() => setMobileMenuOpen(true)}
					>
						<span className="sr-only">Open menu</span>
						<Bars3Icon className="w-6 h-6" aria-hidden="true" />
					</button>
				</div>
				<div className="hidden menu lg:flex lg:gap-x-12">
					{navigation.map((item) => (
						<NavLink
							key={item.name}
							to={item.href}
							className="text-sm font-semibold leading-6 text-white"
						>
							{item.name}
						</NavLink>
					))}
				</div>
				<div className="hidden lg:flex">
					<div className="w-[128px] text-right">
						<UserProfile />
					</div>
				</div>
			</nav>
			<Dialog
				as="div"
				className="lg:hidden"
				open={mobileMenuOpen}
				onClose={setMobileMenuOpen}
			>
				<div className="fixed inset-0 z-10" />
				<Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full px-6 py-6 overflow-y-auto bg-gray-950 sm:max-w-sm sm:ring-1 sm:ring-white/10">
					<div className="flex items-center justify-between">
						<Link
							to="/"
							className="-m-1.5 p-1.5 space-x-3 text-xl font-bold align-middle"
						>
							<img
								className="inline-block w-[40px] h-[40px]"
								src="/logo-inv.svg"
								alt="LINE token"
							/>
							<span className="text-white">
								LINE{" "}
								<sup>
									<small>Beta</small>
								</sup>
							</span>
						</Link>
						<button
							type="button"
							className="-m-2.5 rounded-md p-2.5 text-white"
							onClick={() => setMobileMenuOpen(false)}
						>
							<span className="sr-only">Close menu</span>
							<XMarkIcon className="w-6 h-6" aria-hidden="true" />
						</button>
					</div>
					<div className="flow-root mt-6">
						<div className="-my-6 divide-y divide-gray-500/25">
							<div className="py-6 space-y-2">
								{navigation.map((item) => (
									<Link
										key={item.name}
										onClick={() => setMobileMenuOpen(false)}
										to={item.href}
										className="block px-3 py-2 -mx-3 text-base leading-7 text-gray-200 rounded-lg hover:bg-gray-800"
									>
										{item.name}
									</Link>
								))}
							</div>
							<div className="py-6">
								<UserProfile />
							</div>
						</div>
					</div>
				</Dialog.Panel>
			</Dialog>
		</header>
	);
};
