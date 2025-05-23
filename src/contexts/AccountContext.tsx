"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Address } from "viem";
import {
  Network,
  StableCurrency,
  MerchantAccountGetOutput,
  GetVirtualAccountResponse,
  PersonRole,
  MerchantAccountCreateInput,
} from "@monetic-labs/sdk";
import { Building2, CreditCard, PiggyBank, PlusCircle, CircleDollarSign, type LucideIcon } from "lucide-react";

import { Account, Signer } from "@/types/account";
import pylon from "@/libs/monetic-sdk";
import { useSigners } from "@/contexts/SignersContext";
import { useUser } from "@/contexts/UserContext";
import { deploySubAccount } from "@/utils/safe/features/subaccount";
import { usePasskeySelection } from "@/contexts/PasskeySelectionContext";
import { preciseCurrencyCalculation, roundToCurrency, getCurrentWeek, formatDateString } from "@/utils/helpers";
import { CARD_ACCOUNT, MAIN_ACCOUNT } from "@/utils/constants";

interface AccountContextState {
  accounts: Account[];
  selectedAccount: Account | null;
  isLoadingAccounts: boolean;
  lastFetched: number | null;
  virtualAccount: GetVirtualAccountResponse | null;
  totalBalance: string;
  getEnabledAccounts: () => Account[];
  getSettlementAccount: () => Account | null;
  setSelectedAccount: (account: Account) => void;
  registerSubAccount: (accountAddress: Address, accountName: string) => Promise<boolean>;
  unregisterSubAccount: (accountId: string) => Promise<boolean>;
  refreshAccounts: (force?: boolean) => Promise<Account[]>;
  updateAccountBalancesAfterTransfer: (fromAddress: Address, toAddress: Address, amount: string) => Promise<Account[]>;
  updateVirtualAccountDestination: (destinationAddress: Address) => Promise<void>;
  deployAccount: (accountId: string, signers: Signer[], threshold: number) => Promise<boolean>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Predefined accounts that are always shown
const PREDEFINED_ACCOUNTS: Account[] = [
  {
    id: "predefined-new-account",
    name: "New Account",
    address: "0x0000000000000000000000000000000000000000",
    currency: StableCurrency.USDC,
    balance: 0,
    icon: PlusCircle,
    isDeployed: false,
    threshold: 0,
    signers: [],
    recentActivity: [],
    pendingActivity: [],
    isDisabled: true,
    isComingSoon: true,
    isCreateAccount: true,
    isSettlement: false,
    isCard: false,
  },
];

const AccountContext = createContext<AccountContextState | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    accounts: [] as Account[],
    selectedAccount: null as Account | null,
    isLoadingAccounts: true,
    lastFetched: null as number | null,
    virtualAccount: null as GetVirtualAccountResponse | null,
  });

  const { user, isLoading: isLoadingUser, getCredentials } = useUser();
  const { signers, isLoading: isLoadingSigners, mapSignersToUsers, updateAccountSigners } = useSigners();
  const { selectCredential } = usePasskeySelection();

  const filterVisibleAccounts = (accounts: Account[]) => {
    if (!user) return [];

    // Owners can see all accounts
    if (user.role === PersonRole.OWNER) {
      return accounts;
    }

    // Members can only see accounts where they are signers
    return accounts.filter((account) =>
      account.signers.some(
        (signer) =>
          signer.address.toLowerCase() === user.walletAddress?.toLowerCase() ||
          (user.registeredPasskeys &&
            user.registeredPasskeys.some((key) => key.publicKey.toLowerCase() === signer.address.toLowerCase()))
      )
    );
  };

  const transformAccount = (account: MerchantAccountGetOutput): Account => {
    const isSettlementAccount = account.name.toLowerCase() === MAIN_ACCOUNT;
    const isCardAccount = account.name.toLowerCase() === CARD_ACCOUNT;

    const processedSigners = mapSignersToUsers(account.signers as Address[], account.name);
    const accountSigners = processedSigners.filter((signer) => signer.isAccount);

    if (accountSigners.length > 0) {
      updateAccountSigners(accountSigners);
    }

    return {
      id: account.id,
      address: account.ledgerAddress as Address,
      rainControllerAddress: isCardAccount ? (account.controllerAddress as Address) : undefined,
      name: account.name,
      currency: account.currency,
      balance: parseFloat(account.balance ?? "0"),
      icon: getAccountIcon(account.name),
      isDeployed: account.isDeployed,
      threshold: account.threshold ?? 0,
      signers: processedSigners,
      isSettlement: account.isSettlement || isSettlementAccount,
      isCard: isCardAccount,
      recentActivity: [],
      pendingActivity: [],
      isDisabled: false,
      isComingSoon: false,
      isCreateAccount: false,
    };
  };

  const fetchAccounts = async (force = false) => {
    if (!force && state.lastFetched && Date.now() - state.lastFetched < CACHE_DURATION) {
      return state.accounts;
    }

    try {
      setState((prev) => ({ ...prev, isLoadingAccounts: true }));

      const [accounts, virtualAccount] = await Promise.all([
        pylon.getAccounts(),
        pylon.getVirtualAccount().catch(() => null),
      ]);

      const transformedAccounts = accounts.map(transformAccount);
      const predefinedToShow = user?.role === PersonRole.OWNER ? PREDEFINED_ACCOUNTS : [];
      const visibleAccounts = filterVisibleAccounts(transformedAccounts);
      const accountsWithPredefined = [...visibleAccounts, ...predefinedToShow];

      setState((prev) => ({
        ...prev,
        accounts: accountsWithPredefined,
        selectedAccount: accountsWithPredefined[0] || null,
        isLoadingAccounts: false,
        lastFetched: Date.now(),
        virtualAccount,
      }));

      return accountsWithPredefined;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoadingAccounts: false,
      }));

      return [];
    }
  };

  useEffect(() => {
    if (!isLoadingSigners && !isLoadingUser && user) {
      fetchAccounts();
    }
  }, [isLoadingSigners, isLoadingUser, user]);

  const getAccountIcon = (name: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      [MAIN_ACCOUNT]: CircleDollarSign,
      [CARD_ACCOUNT]: CircleDollarSign,
      savings: PiggyBank,
      "new account": PlusCircle,
    };

    return iconMap[name.toLowerCase()] || Building2;
  };

  const getEnabledAccounts = () => state.accounts.filter((account) => account.isDeployed && !account.isDisabled);

  const getSettlementAccount = () => {
    if (!state.virtualAccount?.destination?.address) return null;

    return (
      state.accounts.find(
        (acc) => acc.address.toLowerCase() === state.virtualAccount?.destination?.address.toLowerCase()
      ) || null
    );
  };

  const totalBalance = state.accounts
    .filter((account) => !account.isComingSoon && !account.isCreateAccount)
    .reduce((sum, account) => sum + account.balance, 0)
    .toString();

  const value = {
    ...state,
    totalBalance,
    getEnabledAccounts,
    getSettlementAccount,
    setSelectedAccount: (account: Account) => setState((prev) => ({ ...prev, selectedAccount: account })),
    registerSubAccount: async (accountAddress: Address, accountName: string) => {
      try {
        const accountData: MerchantAccountCreateInput = {
          name: accountName,
          ledgerAddress: accountAddress,
          network: Network.BASE,
          currency: StableCurrency.USDC,
        };

        const newAccount = await pylon.createAccount(accountData);
        const transformedAccount = transformAccount(newAccount);

        setState((prev) => ({
          ...prev,
          accounts: [...prev.accounts.filter((acc) => !acc.isComingSoon && !acc.isCreateAccount), transformedAccount],
          lastFetched: Date.now(),
        }));

        return true;
      } catch (error) {
        console.error("Error registering sub-account:", error);
        throw new Error("Failed to register sub-account with backend");
      }
    },
    unregisterSubAccount: async (accountId: string) => {
      try {
        // TODO: Implement account deletion with Pylon SDK
        await fetchAccounts(true);

        return true;
      } catch (error) {
        console.error("Error unregistering sub-account:", error);

        return false;
      }
    },
    refreshAccounts: fetchAccounts,
    updateAccountBalancesAfterTransfer: async (fromAddress: Address, toAddress: Address, amount: string) => {
      const amountValue = parseFloat(amount);

      // Log the before and after balances for debugging
      const fromAccount = state.accounts.find((acc) => acc.address.toLowerCase() === fromAddress.toLowerCase());
      const toAccount = state.accounts.find((acc) => acc.address.toLowerCase() === toAddress.toLowerCase());

      if (fromAccount && toAccount) {
        console.log("Before transfer balances:", {
          fromAccount: fromAccount.balance,
          toAccount: toAccount.balance,
          transferAmount: amountValue,
        });
      }

      // Update state with optimistic updates using precise calculations
      setState((prev) => {
        const updatedAccounts = prev.accounts.map((account) => {
          if (account.address.toLowerCase() === fromAddress.toLowerCase()) {
            // Use precise calculation and ensure non-negative balance
            const newBalance = preciseCurrencyCalculation(account.balance, amountValue, "subtract");
            return {
              ...account,
              balance: Math.max(0, roundToCurrency(newBalance)),
            };
          }
          if (account.address.toLowerCase() === toAddress.toLowerCase()) {
            // Use precise calculation for adding to balance
            const newBalance = preciseCurrencyCalculation(account.balance, amountValue, "add");
            return {
              ...account,
              balance: roundToCurrency(newBalance),
            };
          }

          return account;
        });

        return {
          ...prev,
          accounts: updatedAccounts,
        };
      });

      // Return the updated account information for immediate UI feedback
      const updatedFromAccount = state.accounts.find(
        (acc) => acc.address.toLowerCase() === fromAddress.toLowerCase()
      )?.balance;

      const updatedToAccount = state.accounts.find(
        (acc) => acc.address.toLowerCase() === toAddress.toLowerCase()
      )?.balance;

      // Log the updated balances
      console.log("Successfully updated account balances:", {
        fromAccount: updatedFromAccount,
        toAccount: updatedToAccount,
      });

      // Return the updated accounts but don't auto-refresh
      return state.accounts;
    },
    updateVirtualAccountDestination: async (destinationAddress: Address) => {
      setState((prev) => ({
        ...prev,
        virtualAccount: prev.virtualAccount
          ? {
              ...prev.virtualAccount,
              destination: {
                ...prev.virtualAccount.destination,
                address: destinationAddress,
              },
            }
          : null,
      }));

      const data = {
        destination: {
          address: destinationAddress,
        },
      };

      try {
        await pylon.updateVirtualAccount(data);
      } catch (error) {
        console.error("Error updating virtual account:", error);
        fetchAccounts(true).catch(console.error);
      }
    },
    deployAccount: async (accountId: string, signers: Signer[], threshold: number) => {
      try {
        // Get user credentials using the useUser hook
        const credentials = getCredentials();

        if (!credentials || credentials.length === 0) {
          throw new Error("No signing credentials available");
        }

        // Find the account to deploy
        const accountToDeploy = state.accounts.find((acc) => acc.id === accountId);

        if (!accountToDeploy) {
          throw new Error("Account not found");
        }

        // Get the individual safe address
        const individualSafeAddress = user?.walletAddress as Address;

        if (!individualSafeAddress) {
          throw new Error("No wallet address available");
        }

        // Extract signer addresses
        const signerAddresses = signers.map((s) => s.address as Address);

        // Select a credential to use - this will automatically handle showing the modal if needed
        let selectedCredential;
        try {
          selectedCredential = await selectCredential();
        } catch (error) {
          console.error("Credential selection failed:", error);
          throw new Error("Passkey selection failed. Please try again.");
        }

        // Deploy the safe account
        await deploySubAccount({
          individualSafeAddress,
          credentials: selectedCredential,
          signerAddresses,
          threshold,
          callbacks: {
            onSuccess: (safeAddress: Address) => {
              // Update local state
              setState((prev) => ({
                ...prev,
                accounts: prev.accounts.map((account) =>
                  account.id === accountId ? { ...account, isDeployed: true, signers, threshold } : account
                ),
              }));
            },
            onError: (error: Error) => console.error("Deployment error:", error),
          },
        });

        return true;
      } catch (error) {
        console.error("Error deploying account:", error);
        throw error;
      }
    },
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccounts() {
  const context = useContext(AccountContext);

  if (!context) {
    throw new Error("useAccounts must be used within an AccountProvider");
  }

  return context;
}
