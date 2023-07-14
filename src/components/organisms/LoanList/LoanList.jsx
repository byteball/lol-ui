import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";

import { Spin } from "@/components/atoms";
import { LoanItem } from "../LoanItem/LoanItem";

import { selectLoansLoading } from "@/store/slices/loansSlice";
import { selectWalletAddress } from "@/store/slices/settingsSlice";
import { saveAddressAndLoadLoans } from "@/store/thunks/saveAddressAndLoadLoans";

import { getAccount } from "@/utils";
import { selectCheckedBySaleLoans } from "@/store/customSelectors/selectCheckedBySaleLoans";

const big1e18 = 1000000000000000000n;

const filterLoans = (a, b) => {
	return +(
		(BigInt(b.loan_amount) - BigInt(a.loan_amount)) /
		big1e18
	).toString();
};

export const LoanList = () => {
	const dispatch = useDispatch();

	const loans = useSelector(selectCheckedBySaleLoans);

	const sortedLoans = useMemo(() => [...loans].sort(filterLoans), [loans]);

	const walletAddress = useSelector(selectWalletAddress);
	const loading = useSelector(selectLoansLoading);

	const logIn = async () => {
		const accountAddress = await getAccount();

		if (accountAddress) {
			dispatch(saveAddressAndLoadLoans(accountAddress));
		}
	};

	if (loading && walletAddress) return <Spin />;

	if (!walletAddress)
		return (
			<div className="text-center text-gray-600">
				Please,{" "}
				<button className="font-bold underline" onClick={logIn}>
					login
				</button>
			</div>
		);

	if (!sortedLoans || !sortedLoans.length)
		return <div className="text-center text-gray-600">No active loans</div>;

	return (
		<div>
			{sortedLoans.map(
				({
					loan_num,
					current_loan_amount,
					collateral_amount,
					loan_amount,
					ts,
					sale,
				}) => (
					<LoanItem
						key={loan_num}
						loan_num={loan_num}
						current_loan_amount={current_loan_amount}
						collateral_amount={collateral_amount}
						loan_amount={loan_amount}
						ts={ts}
						sale={sale}
					/>
				)
			)}
		</div>
	);
};
