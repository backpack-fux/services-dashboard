import { useState } from 'react';
import { useFormPersistence } from "@/hooks/generics/useFormPersistence";
import { CardCompanyType, ISO3166Alpha2Country } from "@backpack-fux/pylon-sdk";

export const useFormState = (initialEmail: string) => {
  const initialData = {
    companyAccount: {
      company: {
        name: "",
        email: initialEmail,
        registeredAddress: {
            postcode: "",
            city: "",
            state: "",
            country: "US" as ISO3166Alpha2Country,
            street1: "",
        },
        website: "",
      },
    },
    companyDetails: {
      walletAddress: "",
      companyEIN: "",
      companyType: "llc" as CardCompanyType,
      companyDescription: "",
    },
    accountUsers: {
      representatives: [
        {
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          role: "representative" as "owner" | "representative" | "beneficial-owner",
        }],
    },
    userDetails: [
      {
        countryOfIssue: "US" as ISO3166Alpha2Country,
        birthday: "",
        ssn: "",
        registeredAddress: {
          postcode: "",
          street1: "",
          city: "",
          state: "",
          country: "US" as ISO3166Alpha2Country,
        },
      }],
    };

  const {
    data: formData,
    updateData: updateFormData,
    resetData: resetFormData,
  } = useFormPersistence("merchantFormData", initialData);

  const [stepCompletion, setStepCompletion] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
    step6: false,
  });

  const synchronizeUserDetails = (representativesCount: number) => {
    console.log("Synchronizing user details");
    const currentDetailsCount = formData.userDetails.length;
    if (representativesCount > currentDetailsCount) {
      // Add default userDetails
      const additionalDetails = Array(representativesCount - currentDetailsCount).fill({
        countryOfIssue: "US" as ISO3166Alpha2Country,
        birthday: "",
        ssn: "",
        registeredAddress: {
          postcode: "",
          street1: "",
          city: "",
          state: "",
          country: "US" as ISO3166Alpha2Country,
        },
      });
      updateFormData({
        ...formData,
        userDetails: [...formData.userDetails, ...additionalDetails],
      });
    } else if (representativesCount < currentDetailsCount) {
      console.log("Removing excess userDetails");
      // Remove excess userDetails
      updateFormData({
        ...formData,
        userDetails: formData.userDetails.slice(0, representativesCount),
      });
    }
  };

  return {
    formData,
    updateFormData,
    resetFormData,
    stepCompletion,
    setStepCompletion,
    synchronizeUserDetails,
  };
};