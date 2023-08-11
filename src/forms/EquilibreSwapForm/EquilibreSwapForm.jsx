import { Contract, formatUnits, parseUnits } from "ethers";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { isNaN } from "lodash";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import cn from "classnames";
import ReactGA from "react-ga4";

import { Input } from "@/components/atoms";
import { MetaMaskButton } from "@/components/molecules";

import { selectCollateralSymbol, selectCollateralTokenAddress, selectDecimals, selectSymbol, selectWalletAddress } from "@/store/slices/settingsSlice"
import { sendNotification } from "@/store/thunks/sendNotification";

import { getCountOfDecimals, recognizeMetamaskError, toLocalString } from "@/utils";

import { provider } from "@/services/provider";
import contractAPI from "@/services/contractAPI";
import { useLazyEffect } from "@/hooks";

import equilibreABI from "@/abi/EquilibreRouter.json";

import appConfig from "@/appConfig";

export const EquilibreSwapForm = () => {
  const [type, setType] = useState("buy");
  const [loading, setLoading] = useState(false);
  const [tokenAmount, setTokenAmount] = useState({ value: "", valid: false, calculating: true, updateFor: null });
  const [collateralAmount, setCollateralAmount] = useState({ value: "1", valid: true, calculating: false, updateFor: null });

  const btnRef = useRef();

  const symbol = useSelector(selectSymbol);
  const decimals = useSelector(selectDecimals);
  const collateralTokenAddress = useSelector(selectCollateralTokenAddress);
  const collateralSymbol = useSelector(selectCollateralSymbol);
  const walletAddress = useSelector(selectWalletAddress);

  const dispatch = useDispatch();

  useEffect(() => {
    const intervalID = setInterval(async () => {
      if (type === "buy") {
        setTokenAmount(o => ({ ...o, updateFor: o.value }));
        await getAmountOut(collateralAmount.value, collateralTokenAddress, appConfig.CONTRACT).then((value) => setTokenAmount(old => ({ ...old, value: old.updateFor === old.value ? value : old.value })));
      } else {
        setCollateralAmount(o => ({ ...o, updateFor: o.value }));
        await getAmountOut(tokenAmount.value, appConfig.CONTRACT, collateralTokenAddress).then((value) => setCollateralAmount(old => ({ ...old, value: old.updateFor === old.value ? value : old.value })));
      }
    }, 1000 * 60);

    return () => {
      clearInterval(intervalID);
    }
  }, [type, tokenAmount, collateralAmount]);

  const tokenHandleChange = (ev, v) => {
    const value = v || ev.target.value.trim();
    const valid = !isNaN(Number(value)) && Number(value) > 0;

    if (value === "." || value === ",") {
      setTokenAmount((o) => ({ ...o, value: "0.", valid: false }));
    } else if (
      getCountOfDecimals(value) <= (decimals < 18 ? decimals : 18) &&
      Number(value) <= 1e6 &&
      Number(value) >= 0
    ) {
      setTokenAmount((o) => ({ ...o, value, valid }));
      setCollateralAmount(o => ({ ...o, value: "", valid: false, calculating: true }));
    }
  };

  const collateralHandleChange = (ev, v) => {
    const value = v || ev.target.value.trim();
    const valid = !isNaN(Number(value)) && Number(value) > 0;

    if (value === "." || value === ",") {
      setCollateralAmount(o => ({ ...o, value: "0.", valid: false }));
    } else if (
      getCountOfDecimals(value) <= (decimals < 18 ? decimals : 18) &&
      Number(value) <= 1e6 &&
      Number(value) >= 0
    ) {
      setCollateralAmount((o) => ({ ...o, value, valid }));
      setTokenAmount(o => ({ ...o, value: "", valid: false, calculating: true }));
    }
  };

  const getAmountOut = async (amount, tokenIn, tokenOut) => {
    const contract = new Contract(appConfig.EQUILIBRE_ROUTER_CONTRACT, equilibreABI, provider);
    const res = await contract.getAmountOut(parseUnits(String(amount)), tokenIn, tokenOut);

    return (Math.floor(Number(formatUnits(res[0], 18)) * 1e18) / 1e18).toFixed(18).replace(/0*$/, "")
  };

  useLazyEffect(() => {
    if (!tokenAmount.calculating && collateralAmount.calculating) {
      if (Number(tokenAmount.value)) {
        getAmountOut(tokenAmount.value, appConfig.CONTRACT, collateralTokenAddress).then((value) => setCollateralAmount({ value, valid: true, calculating: false }));
      } else {
        setCollateralAmount({ value: 0, valid: false, calculating: false });
      }
    }
  }, [tokenAmount, collateralAmount], 800);

  useLazyEffect(() => {
    if (!collateralAmount.calculating && tokenAmount.calculating) {
      if (Number(collateralAmount.value)) {
        getAmountOut(collateralAmount.value, collateralTokenAddress, appConfig.CONTRACT).then((value) => setTokenAmount({ value, valid: true, calculating: false }));
      } else {
        setTokenAmount({ value: 0, valid: false, calculating: false });
      }
    }
  }, [collateralAmount, tokenAmount], 800);

  const changeDirection = async () => {
    if (!tokenAmount.calculating && !collateralAmount.calculating) {
      setType(type === "buy" ? "sell" : "buy");

      if (type === "buy") { // will be sell
        setCollateralAmount({ value: "", calculating: true, valid: false });
      } else { // will be buy
        setTokenAmount({ value: "", calculating: true, valid: false });
      }
    }
  }

  const handleKeyDown = (ev) => {
    if (ev.code === "Enter" || ev.code === "NumpadEnter") {
      btnRef.current.click();
    }
  };

  const swap = async () => {
    try {
      setLoading(true);
      const signer = await contractAPI.getSigner();
      await contractAPI.changeNetwork();
      await contractAPI.approve(type === "buy" ? parseUnits(String(collateralAmount.value), 18) : parseUnits(String(tokenAmount.value), 18), type === "buy" ? collateralTokenAddress : appConfig.CONTRACT, appConfig.EQUILIBRE_ROUTER_CONTRACT);
      const contract = new Contract(appConfig.EQUILIBRE_ROUTER_CONTRACT, equilibreABI, signer);

      const res = await contract.swapExactTokensForTokensSimple(type === "buy" ? parseUnits(Number(collateralAmount.value).toFixed(18), 18) : parseUnits(Number(tokenAmount.value).toFixed(18), 18), type === "buy" ? parseUnits(Number(tokenAmount.value * ((100 - appConfig.SLIPPAGE_TOLERANCE_PERCENT) / 100)).toFixed(18), 18) : parseUnits(Number(collateralAmount.value * ((100 - appConfig.SLIPPAGE_TOLERANCE_PERCENT) / 100)).toFixed(18), 18), type === 'buy' ? collateralTokenAddress : appConfig.CONTRACT, type === 'buy' ? appConfig.CONTRACT : collateralTokenAddress, false, walletAddress, BigInt(String(Date.now() + 1000 * 60 * 60)));

      dispatch(
        sendNotification({
          title: "Transaction successful",
          type: "success",
        })
      );

      setLoading(false);

      ReactGA.event({
        category: "swap",
        action: type,
        value: type === "buy" ? +collateralAmount.value : +tokenAmount.value
      });

      await res.wait();

      if (type === "buy") {
        setTokenAmount(t => ({ ...t, calculating: true }))
      } else {
        setCollateralAmount((c => ({ ...c, calculating: true })))
      }
    } catch (error) {
      const notificationPayload = recognizeMetamaskError(error);
      dispatch(sendNotification(notificationPayload));
      setLoading(false);
    }
  };

  const controllers = [<Input
    label={type === "sell" ? "You send" : "You get"}
    placeholder=""
    value={tokenAmount.value}
    onKeyDown={handleKeyDown}
    loading={tokenAmount.calculating}
    disabled={tokenAmount.calculating || type === "buy"}
    key="1"
    suffix={symbol}
    onChange={tokenHandleChange}
  />,

  <div className="flex justify-center p-3 select-none">
    <ArrowsUpDownIcon
      className={cn("w-8 h-8", tokenAmount.calculating || collateralAmount.calculating ? "cursor-not-allowed opacity-20" : "cursor-pointer")}
      onClick={changeDirection}
    />
  </div>,

  <Input
    label={type === "sell" ? "You get" : "You send"}
    placeholder=""
    onKeyDown={handleKeyDown}
    key="2"
    value={collateralAmount.value}
    loading={collateralAmount.calculating}
    disabled={collateralAmount.calculating || type === "sell"}
    suffix={collateralSymbol}
    onChange={collateralHandleChange}
  />];

  const swapDisabled = !tokenAmount.valid || !collateralAmount.valid || Number(tokenAmount.value) <= 0 || Number(collateralAmount.value) <= 0 || tokenAmount.calculating || collateralAmount.calculating || !walletAddress;

  return <div>
    <div className="block mb-3 text-sm font-medium text-white/60">
      Note that price protection works only if you obtain LINE by borrowing, not by buying.
    </div>
    <div className="mb-3">
      {type === "buy" ? controllers.reverse() : controllers}
    </div>

    <div className="block mb-1 text-sm font-medium text-white/60">
      Slippage tolerance
      <span className="ml-1 text-gray-300">
        {appConfig.SLIPPAGE_TOLERANCE_PERCENT}%
      </span>
    </div>

    <div className="block mb-5 text-sm font-medium text-white/60">
      {symbol} price
      <span className="ml-1 text-gray-300">
        {Number(tokenAmount.value) && Number(collateralAmount.value) ? toLocalString(collateralAmount.value / tokenAmount.value) : (tokenAmount.calculating || collateralAmount.calculating ? "loading..." : 0)}{" "}
        {!tokenAmount.calculating && !collateralAmount.calculating ? <small>{collateralSymbol} </small> : null}
      </span>
    </div>

    <MetaMaskButton
      type="light"
      onClick={swap}
      loading={loading}
      ref={btnRef}
      block
      disabled={swapDisabled}
    >
      {type === "buy" ? "Buy" : "Sell"}
    </MetaMaskButton>

    <div className="px-2 pt-2 text-xs text-center text-white/60">
      Swaps are processed by <a href="https://equilibrefinance.com/" target="_blank" rel="noopener">équilibre DEX</a>
    </div>
  </div>
}