import { createIcon } from "opepen-standard";

import { ChainAddress, OrderID } from "@/types";
import { PostcodeLookupResult } from "@/hooks/generics/usePostcodeLookup";

export const isLocal = process.env.NEXT_PUBLIC_NODE_ENV === "development";
export const isTesting = process.env.NEXT_PUBLIC_NODE_ENV === "ci";
export const isStaging = process.env.NEXT_PUBLIC_NODE_ENV === "staging";
export const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";

export function generateUserInviteUrl(onboardId: string, email: string): string {
  return `/onboard/${onboardId}?email=${encodeURIComponent(email)}`;
}

export function formatBalance(balance: number, currency: string): string {
  return `${mapCurrencyToSymbol[currency]} ${balance.toFixed(2)} ${currency.toUpperCase()}`;
}

export const mapCurrencyToSymbol: Record<string, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
  cad: "$",
  aud: "$",
  nzd: "$",
};

export function generatePlaceholderOrderID(): OrderID {
  const generateGroup = () => Math.floor(1000 + Math.random() * 9000).toString();

  return `${generateGroup()}-${generateGroup()}-${generateGroup()}-${generateGroup()}` as OrderID;
}

export function generatePlaceholderFID(): number {
  return Math.floor(1000 + Math.random() * 9000);
}

export function generatePlaceholderSettlementAddress(): ChainAddress {
  return `0x${Math.random().toString(16).slice(2, 18)}` as ChainAddress;
}

export function getOpepenAvatar(address: string, size: number): string {
  const canvas = createIcon({
    seed: address,
    size,
  });

  return canvas.toDataURL();
}

export const lookupPostcode = async (postcode: string) => {
  try {
    const response = await fetch(`/api/lookup-postcode?postcode=${postcode}`);

    if (!response.ok) {
      throw new Error("Postcode not found");
    }
    const result: PostcodeLookupResult = await response.json();

    // Ensure the state and country are in the correct format
    return {
      city: result.city,
      state: result.state,
      postcode: result.postcode,
      country: result.country,
    };
  } catch (error) {
    console.error("Error looking up postcode:", error);
    throw error;
  }
};

export const centsToDollars = (cents: number): string => {
  return (cents / 100).toFixed(2);
};

export const formattedDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  return date.toLocaleString("en-GB", options);
};

/**
 * Converts a timestamp to a human-readable relative time string
 * @param timestamp - ISO timestamp string
 * @returns Formatted string like "2 hours ago"
 */
export const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
};

/**
 * Combines first and last name into a full name
 * @param firstName - Person's first name
 * @param lastName - Person's last name
 * @returns Combined full name string
 */
export const getFullName = (firstName: string, lastName: string) => {
  return `${firstName} ${lastName}`;
};

/**
 * Formats a number using US locale formatting
 * @param value - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
  }).format(value);
};

/**
 * Formats a number as USD currency
 * @param value - Number to format as currency
 * @returns Formatted currency string
 */
export const formatAmountUSD = (value: number) => {
  return new Intl.NumberFormat("en-US", { currency: "USD" }).format(value);
};

/**
 * Formats a decimal number string to always have 2 decimal places
 * @param value - Decimal number string
 * @returns Formatted string with exactly 2 decimal places
 */
export const formatDecimals = (value: string): string => {
  const [whole, decimal = ""] = value.split(".");
  const truncatedDecimal = decimal.slice(0, 2).padEnd(2, "0");

  return `${whole}.${truncatedDecimal}`;
};
