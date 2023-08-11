import { ethers } from "ethers";

import { saveAddressAndLoadLoans } from "@/store/thunks/saveAddressAndLoadLoans";
import { store } from ".."

export const TransferLoanNftEvent = (from, to, tokenId) => {
  console.log("event: transfer loan", from, to, tokenId);

  const state = store.getState();

  const walletAddress = state.settings.walletAddress;

  if (!walletAddress || from === ethers.ZeroAddress) return;

  if (from.toLowerCase() === walletAddress.toLowerCase() || to.toLowerCase() === walletAddress.toLowerCase()) {
    store.dispatch(saveAddressAndLoadLoans(walletAddress));
  }
}
