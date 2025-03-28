import { http, createPublicClient, Chain, fallback, createWalletClient, publicActions } from "viem";
import { baseSepolia, base } from "viem/chains";

import { isProduction } from "@/utils/helpers";
import "viem/window";

// Environment variables validation
const CANDIDE_API_KEY = process.env.NEXT_PUBLIC_CANDIDE_API_KEY;

if (!CANDIDE_API_KEY) throw new Error("NEXT_PUBLIC_CANDIDE_API_KEY is not set");

const policyId = process.env.NEXT_PUBLIC_CANDIDE_BASE_SPONSORSHIP_POLICY_ID;

if (!policyId) throw new Error("CANDIDE_BASE_SEPOLIA_SPONSORSHIP_POLICY_ID is not set");

// Chain configuration
export const chain = isProduction ? base : baseSepolia;
export const PUBLIC_RPC = chain.rpcUrls.default.http[0];

// Chain name mapping
export const getChainName = (chain: Chain): string => {
  switch (chain.id) {
    case 84532:
      return "base-sepolia";
    case 8453:
      return "base";
    default:
      throw new Error(`Unsupported chain ID: ${chain.id}`);
  }
};

// Get sponsorship policy ID based on chain
const getSponsorshipPolicyId = (chain: Chain): string => {
  switch (chain.id) {
    case 8453:
    case 84532:
      return policyId;
    default:
      throw new Error(`No sponsorship policy ID configured for chain ID: ${chain.id}`);
  }
};

// Define RPC endpoints based on environment
const baseMainnetRPCs = [
  http("https://8453.rpc.thirdweb.com"),
  http("https://base-mainnet.public.blastapi.io"),
  http("https://rpc.ankr.com/base"),
];

const baseSepoliaRPCs = [
  http("https://84532.rpc.thirdweb.com"),
  http("https://base-sepolia.public.blastapi.io"),
  http("https://rpc.ankr.com/base_sepolia"),
];

// Public client configuration
export const publicClient = createPublicClient({
  chain,
  transport: fallback(isProduction ? baseMainnetRPCs : baseSepoliaRPCs),
  cacheTime: 5_000,
  batch: {
    multicall: true,
  },
});

// Candide API endpoints
const CANDIDE_BASE_URL = "https://api.candide.dev";
const chainName = getChainName(chain);

export const BUNDLER_URL = `${CANDIDE_BASE_URL}/bundler/v3/${chainName}/${CANDIDE_API_KEY}`;
export const PAYMASTER_URL = `${CANDIDE_BASE_URL}/paymaster/v3/${chainName}/${CANDIDE_API_KEY}`;
export const SPONSORSHIP_POLICY_ID = getSponsorshipPolicyId(chain);
