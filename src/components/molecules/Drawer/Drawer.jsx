import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const Drawer = ({ open, setOpen, title, children = null }) => (
	<Transition.Root show={open} as={Fragment}>
		<Dialog
			as="div"
			className="relative z-10"
			onClose={setOpen}
			initialFocus={null}
		>
			<Transition.Child
				as={Fragment}
				enter="ease-in-out duration-500"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="ease-in-out duration-500"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<div className="fixed inset-0 transition-opacity bg-white bg-opacity-10" />
			</Transition.Child>

			<div className="fixed inset-0 overflow-hidden">
				<div className="absolute inset-0 overflow-hidden">
					<div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
						<Transition.Child
							as={Fragment}
							enter="transform transition ease-in-out duration-500 sm:duration-700"
							enterFrom="translate-x-full"
							enterTo="translate-x-0"
							leave="transform transition ease-in-out duration-500 sm:duration-700"
							leaveFrom="translate-x-0"
							leaveTo="translate-x-full"
						>
							<Dialog.Panel className="w-screen max-w-lg pointer-events-auto">
								<div className="flex flex-col h-full py-6 overflow-y-scroll shadow-xl bg-gray-950">
									<div className="px-4 sm:px-6">
										<div className="flex items-start justify-between">
											{!!title && (
												<Dialog.Title className="text-xl font-semibold leading-6 text-gray-300">
													{title}
												</Dialog.Title>
											)}
											<div className="flex items-center ml-3 h-7">
												<button
													type="button"
													className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
													onClick={() => setOpen(false)}
												>
													<span className="sr-only">Close panel</span>
													<XMarkIcon className="w-6 h-6" aria-hidden="true" />
												</button>
											</div>
										</div>
									</div>
									<div className="relative flex-1 px-4 mt-6 text-white sm:px-6">
										{children}
									</div>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</div>
		</Dialog>
	</Transition.Root>
);
