import type UniversalProvider from "@walletconnect/universal-provider";

import { encodeFunctionData, Address, parseUnits, Hex } from "viem";

import { modal } from "@/context/reown";
import { getChain, publicClient } from "@/config/web3";
import { TransferStatus } from "@/components/generics/transfer-status";

import { BASE_USDC } from "./constants";

type BuildTransferArgs = {
  liquidationAddress: Address;
  amount: string;
  settlementAddress: Address;
  setTransferStatus: (status: TransferStatus) => void;
};

const getProvider = async (): Promise<UniversalProvider> => {
  const wcProvider = await modal.universalAdapter?.getWalletConnectProvider();

  if (!wcProvider) {
    throw new Error("No wallet provider found");
  }

  return wcProvider;
};

export const getAccount = async (): Promise<Address> => {
  const wcProvider = await getProvider();
  // OR await wcProvider.request({ method: "eth_requestAccounts" })
  const accounts = await wcProvider.enable();

  if (!accounts) {
    throw new Error("No connected accounts found");
  }

  return accounts[0] as Address;
};

const buildTransfer = async ({
  liquidationAddress,
  amount,
  settlementAddress,
  setTransferStatus,
}: BuildTransferArgs): Promise<Hex> => {
  const wcProvider = await getProvider();

  if (!settlementAddress) {
    settlementAddress = await getAccount();
  }

  const transferData = encodeFunctionData({
    abi: BASE_USDC.ABI,
    functionName: "transfer",
    args: [liquidationAddress, parseUnits(amount, BASE_USDC.DECIMALS)], // [Liquidation Address, Amount]
  });

  const transactionParameters = {
    from: settlementAddress, // The sender's address
    to: BASE_USDC.ADDRESS, // The USDC contract address
    data: transferData,
  };

  const { result } = await publicClient.simulateContract({
    address: BASE_USDC.ADDRESS,
    abi: BASE_USDC.ABI,
    functionName: "transfer",
    args: [liquidationAddress, parseUnits(amount, BASE_USDC.DECIMALS)],
    account: settlementAddress,
  });

  if (!result) throw new Error("Failed to simulate contract");

  setTransferStatus(TransferStatus.WAITING);

  return await wcProvider.request(
    {
      method: "eth_sendTransaction",
      params: [transactionParameters],
    },
    `eip155:${getChain().id}`
  );
};

export { buildTransfer };
