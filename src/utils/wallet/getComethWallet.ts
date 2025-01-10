import type { Address, HDAccount, PrivateKeyAccount } from "viem";
import { chain, publicClient } from "@/config/web3";
import { PASSKEY_NAME } from "@/utils/constants";
import {
  createComethPaymasterClient,
  createSafeSmartAccount,
  createSmartAccountClient,
  ENTRYPOINT_ADDRESS_V07,
  webAuthnOptions,
} from "@cometh/connect-sdk-4337";
import { http } from "viem";
import { web3Config } from "@/config/web3";

type ComethSignerConfig = {
  disableEoaFallback?: boolean;
  encryptionSalt?: string;
  webAuthnOptions?: webAuthnOptions;
  passKeyName?: string;
  fullDomainSelected?: boolean;
};

export const cometh4337SignerConfig: ComethSignerConfig = {
  webAuthnOptions: {
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      residentKey: "preferred",
      userVerification: "required",
    },
  },
  passKeyName: PASSKEY_NAME,
  disableEoaFallback: true,
};

export const cometh4337Params = {
  apiKey: web3Config.cometh.apiKey,
  publicClient,
  chain,
  bundlerUrl: `https://bundler.cometh.io/${chain.id}?apikey=${web3Config.cometh.apiKey}`,
  paymasterUrl: `https://paymaster.cometh.io/${chain.id}?apikey=${web3Config.cometh.apiKey}`,
};

export const getCometh4337Wallet = async (address?: Address, signer?: any) => {
  const { apiKey, chain, bundlerUrl, paymasterUrl, publicClient } = cometh4337Params;

  console.log(signer, " <--- Signer");
  console.log(address, " <--- Safe Address");

  const smartAccount = await createSafeSmartAccount({
    apiKey,
    chain,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    smartAccountAddress: address,
    comethSignerConfig: cometh4337SignerConfig,
    clientTimeout: 180_000,
    signer: signer ?? undefined,
    publicClient,
  });

  const paymasterClient = createComethPaymasterClient({
    transport: http(paymasterUrl),
    chain,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    publicClient,
  });

  const smartAccountClient = createSmartAccountClient({
    account: smartAccount,
    publicClient,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain,
    bundlerTransport: http(bundlerUrl, { retryCount: 10, retryDelay: 200, timeout: 180_000 }),
    middleware: {
      sponsorUserOperation: paymasterClient.sponsorUserOperation,
      gasPrice: paymasterClient.gasPrice,
    },
  });

  console.log(smartAccountClient, "smartAccountClient", smartAccount);
  return {
    smartAccountClient,
    smartAccount,
    walletAddress: smartAccount.address,
  };
};
