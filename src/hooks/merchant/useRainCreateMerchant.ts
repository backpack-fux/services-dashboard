import { useState } from "react";
import pylon from "@/libs/pylon-sdk";
import { MerchantRainCompanyCreateOutput, MerchantRainCompanyCreateInput } from "@backpack-fux/pylon-sdk";
import { RainMerchantCreateDto } from "@/types/dtos/rainDTO";
import { merchantConfig } from "@/config/merchant";

export const useRainCreateMerchant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MerchantRainCompanyCreateOutput | null>(null);

  const createRainMerchant = async (data: RainMerchantCreateDto): Promise<MerchantRainCompanyCreateOutput | null> => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const createRainMerchant: MerchantRainCompanyCreateInput = {
        initialUser: {
          ...data.initialUser,
          //id: merchantConfig.id,
          // @ts-ignore
          iovationBlackbox: merchantConfig.iovationBlackbox,
        },
        name: data.name,
        entity: data.entity,
        address: data.address,
        // representatives: data.representatives.map(t => ({...t, id : merchantConfig.id})),
        // ultimateBeneficialOwners: data.ultimateBeneficialOwners.map(t => ({...t, id : merchantConfig.id})),
      };
      
      console.log("useRainCreateMerchant:", JSON.stringify(createRainMerchant, null, 2));
      const response = await pylon.applyCardCompany(createRainMerchant);

      console.log("useRainCreateMerchant response:", response);

      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : "An error occurred";

      setError(errorMessage);
      console.error("useCreateMerchant error:", errorMessage);

      return null;
    }
  };

  return {
    createRainMerchant,
    isLoading,
    error,
    data,
  };
};