import { http, createPublicClient, type PublicClient, type Transport, type Chain } from "viem";
import { baseSepolia, base } from "viem/chains";

import { isLocal } from "@/utils/helpers";
import "viem/window";

export const chain = isLocal ? baseSepolia : base;

export const publicClient = createPublicClient({
  chain,
  transport: http(),
  batch: {
    multicall: true,
  },
}) as PublicClient<Transport, Chain>;

if (!process.env.NEXT_PUBLIC_COMETH_API_KEY) {
  throw new Error("COMETH_API_KEY is not set");
}

export const web3Config = {
  cometh: {
    apiKey: process.env.NEXT_PUBLIC_COMETH_API_KEY,
  },
};
