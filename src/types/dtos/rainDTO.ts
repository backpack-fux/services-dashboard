// dtos/rainDtos.ts

import { ISO3166Alpha2Country } from "@backpack-fux/pylon-sdk";
import { CardCompanyType } from "@backpack-fux/pylon-sdk";

export type RainAddressDto = {
  street1: string;
  street2?: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: ISO3166Alpha2Country;
  country: ISO3166Alpha2Country;
};

export type RainPersonDto = {
  id?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nationalId: string;
  countryOfIssue: ISO3166Alpha2Country;
  email: string;
  address: RainAddressDto;
};

export type RainInitialUserDto = RainPersonDto & {
  isTermsOfServiceAccepted: boolean;
  role?: string;
  walletAddress?: string;
  iovationBlackbox?: string;
};

export type RainEntityDto = {
  name: string;
  type?: CardCompanyType;
  description: string;
  taxId: string;
  website: string;
  expectedSpend?: string;
};

export type RainMerchantCreateDto = {
  initialUser: RainInitialUserDto;
  address: RainAddressDto;
  entity: RainEntityDto;
  name: string;
  representatives: RainPersonDto[];
  ultimateBeneficialOwners: RainPersonDto[];
};