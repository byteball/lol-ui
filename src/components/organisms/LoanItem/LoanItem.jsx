import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { formatEther } from "ethers";
import Tooltip from "rc-tooltip";
import { Link } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import cn from "classnames";

import {
	InfoTooltip,
	MetaMaskButton,
	QuestionTooltip,
} from "@/components/molecules";
import { Button } from "@/components/atoms";
import { CopyIcon, SellIcon } from "@/components/icons";

import { sendNotification } from "@/store/thunks/sendNotification";

import contractAPI from "@/services/contractAPI";

import { recognizeMetamaskError, toLocalString } from "@/utils";
import { selectLoanNFTAddress } from "@/store/slices/settingsSlice";

export const LoanItem = ({
	loan_num,
	current_loan_amount,
	collateral_amount,
	loan_amount,
	ts,
	sale = false,
}) => {
	const [repayingId, setRepayingId] = useState(false);
	const dispatch = useDispatch();
	const loanNFTAddress = useSelector(selectLoanNFTAddress);

	const repay = async (loan_num) => {
		setRepayingId(loan_num);
		try {
			await contractAPI.repay(loan_num);

			dispatch(
				sendNotification({
					title: "Transaction successful",
					type: "success",
				})
			);
		} catch (error) {
			const notificationPayload = recognizeMetamaskError(error);
			dispatch(sendNotification(notificationPayload));
		} finally {
			setRepayingId(false);
		}
	};

	const copy = () => {
		dispatch(
			sendNotification({
				title: "Address successfully copied to clipboard",
			})
		);
	};

	return (
		<div className="flex flex-col flex-wrap w-full px-3 py-2 mb-5 border rounded-lg xs:flex-nowrap xs:px-5 xs:py-3 sm:flex-row last:mb-0 bg-primary/10 border-primary/20">
			<div className="flex flex-wrap space-y-2 xs:space-y-0 xs:flex-nowrap basis-full xs:basis-4/5">
				<div className="basis-full xs:basis-2/4">
					<div className="text-sm font-light text-white/60">
						Loan amount{" "}
						<QuestionTooltip description="The amount needed to repay the loan now. It includes the interest accrued so far." />{" "}
					</div>
					<div className="font-semibold text-white text-md">
						{toLocalString(
							(+formatEther(current_loan_amount || loan_amount)).toPrecision(7)
						)}{" "}
						<small>LINE</small>
					</div>
				</div>

				<div className="basis-full xs:basis-2/4">
					<div className="text-sm font-light text-white/60">Collateral</div>
					<div className="font-semibold text-white text-md">
						{toLocalString((+formatEther(collateral_amount)).toPrecision(7))} <small>GBYTE</small>
					</div>
				</div>
			</div>

			<div className="flex items-center space-x-2 basis-full sm:basis-1/5">
				<div className="mt-2 sm:mt-0">
					<MetaMaskButton
						loading={repayingId === loan_num}
						className="block w-full"
						type="light"
						onClick={() => repay(loan_num)}
					>
						Repay
					</MetaMaskButton>
				</div>

				<Link
					to={sale ? undefined : `/market/sell/${loan_num}`}
					className={cn("block", { "opacity-30 cursor-not-allowed": sale })}
				>
					<Tooltip
						className="hidden sm:inline"
						placement="top"
						trigger={["hover"]}
						overlayClassName="max-w-[250px]"
						overlay={sale ? "Already on sale" : "Sell on the market"}
					>
						<div>
							<SellIcon className="" />
						</div>
					</Tooltip>
					<Button type="light" disabled={sale} className="block mt-2 sm:hidden">
						Sell a loan
					</Button>
				</Link>

				<div className="hidden sm:flex">
					<InfoTooltip
						description={
							<span className="break-words">
								<div className="mb-2">
									Opened on: {moment.unix(ts).format("LLL")}
								</div>
								<div>
									This loan is an NFT. To add it to your MetaMask, select
									"Import NFTs" in your MetaMask and enter the address "
									{loanNFTAddress}"{" "}
									<CopyToClipboard onCopy={copy} text={loanNFTAddress}>
										<button>
											<CopyIcon className="h-[1.1em] w-[1.1em] cursor-pointer stroke-primary inline" />
										</button>
									</CopyToClipboard>{" "}
									and token ID "{loan_num}"
								</div>
							</span>
						}
					/>
				</div>
			</div>
		</div>
	);
};
