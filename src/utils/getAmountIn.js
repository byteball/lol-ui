import { Contract, ethers, formatUnits, parseUnits } from "ethers";

import { provider } from "@/services/provider";

import equilibrePair from "@/abi/EquilibrePair.json";

import { addDecimals, addPair, addPairTokens, addReserves, updateFee } from "@/store/slices/cacheSlice";

import appConfig from "@/appConfig";
import { store } from "..";

export const getAmountIn = async (inAsset, outAsset, outAmount) => {

  const pairFactoryAbi = [
    "function getPair(address tokenA, address tokenB, bool stable) external view returns (address pair)",
    "function getFee(bool _stable) external view returns (uint256 fee)"
  ];

  const state = store.getState();
  const dispatch = store.dispatch;

  const pairFactoryContract = new Contract(appConfig.PAIR_FACTORY_ADDRESS, pairFactoryAbi, provider);

  let pairContractAddress = state.cache.pairs.find((pair) => pair.inAsset.toLowerCase() === inAsset.toLowerCase() && pair.outAsset.toLowerCase() === outAsset.toLowerCase())?.pairContract;

  if (!pairContractAddress) {
    pairContractAddress = await pairFactoryContract.getPair(inAsset, outAsset, false);

    if (pairContractAddress !== ethers.ZeroAddress) {
      dispatch(addPair({ inAsset, outAsset, pairContract: pairContractAddress }));
    }
  }

  if (pairContractAddress !== ethers.ZeroAddress) {
    const pairContract = new Contract(pairContractAddress, equilibrePair, provider);

    let token0;
    let token1;

    if (pairContractAddress in state.cache.tokensByPair) {
      [token0, token1] = state.cache.tokensByPair[pairContractAddress];
    } else {
      token0 = await pairContract.token0();
      token1 = await pairContract.token1();

      dispatch(addPairTokens({ pair: pairContractAddress, tokens: [token0, token1] }))
    }

    let _reserve0;
    let _reserve1;

    if (pairContractAddress in state.cache.reservesByPair && Date.now() - state.cache.reservesByPair[pairContractAddress].ts < 60 * 1000) {
      [_reserve0, _reserve1] = state.cache.reservesByPair[pairContractAddress].value;

      _reserve0 = BigInt(_reserve0);
      _reserve1 = BigInt(_reserve1);

      console.log("log: using cached reserves");
    } else {
      console.log("log: loading reserves");
      [_reserve0, _reserve1] = await pairContract.getReserves();
      dispatch(addReserves({ pair: pairContractAddress, reserves: [_reserve0.toString(), _reserve1.toString()] }));
    }

    const erc20Abi = ["function decimals() view returns (uint256)"];

    const token0Contract = new Contract(token0, erc20Abi, provider);
    const token1Contract = new Contract(token1, erc20Abi, provider);

    let d0 = state.cache.decimalsByToken[token0.toLowerCase()];
    let d1 = state.cache.decimalsByToken[token1.toLowerCase()];

    if (d0 === undefined) {
      d0 = await token0Contract.decimals();
      dispatch(addDecimals({ token: token0.toLowerCase(), decimals: d0.toString() }));
    } else {
      d0 = BigInt(d0);
    }

    if (d1 === undefined) {
      d1 = await token1Contract.decimals();
      dispatch(addDecimals({ token: token1.toLowerCase(), decimals: d1.toString() }));
    } else {
      d1 = BigInt(d1);
    }

    _reserve0 = parseUnits(_reserve0.toString(), BigInt((18 - +(d0.toString())).toString()));
    _reserve1 = parseUnits(_reserve1.toString(), BigInt((18 - +(d1.toString())).toString()));

    let fee = state.cache.fee.value;

    if (fee !== undefined && fee !== null && state.cache.fee.ts + 3600 * 1000 > Date.now()) {
      fee = BigInt(state.cache.fee.value);
    } else {
      fee = await pairFactoryContract.getFee(false);
      dispatch(updateFee({ value: fee.toString() }));
    }

    const [reserveA, reserveB] = inAsset.toLowerCase() === token0.toLowerCase() ? [_reserve0, _reserve1] : [_reserve1, _reserve0];
    const [decimalsA, decimalsB] = inAsset.toLowerCase() === token0.toLowerCase() ? [d0, d1] : [d1, d0];

    const formattedFee = +formatUnits(fee.toString(), BigInt("4"));

    const resA = +formatUnits(reserveA.toString(), decimalsA);
    const resB = +formatUnits(reserveB.toString(), decimalsB);

    let amountIn = ((outAmount * resA) / (resB - outAmount)) / 10 ** (Number(decimalsB.toString()) - Number(decimalsA.toString()));

    amountIn += amountIn * formattedFee;

    return [amountIn > 0 ? amountIn : null, [{ from: inAsset, to: outAsset, stable: false }]];
  } else {
    const [usdtAmount, routesToUSDT] = await getAmountIn(appConfig.USDT_CONTRACT, outAsset, outAmount);

    if (usdtAmount > 0) {

      const [tokenAmount, routesFromUSDT] = await getAmountIn(inAsset === ethers.ZeroAddress ? appConfig.WKAVA_ADDRESS : inAsset, appConfig.USDT_CONTRACT, usdtAmount.toFixed(6));

      return [tokenAmount > 0 ? tokenAmount : null, [...routesFromUSDT, ...routesToUSDT,]];
    } else {
      return [null];
    }
  }
}