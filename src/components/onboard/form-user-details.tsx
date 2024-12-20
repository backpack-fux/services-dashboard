import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ISO3166Alpha2Country } from "@backpack-fux/pylon-sdk";

import { FormInput } from "@/components/generics/form-input";
import {
  birthdayRegex,
  CompanyUserDetailsSchema,
  companyUserDetailsSchema,
  ssnRegex,
} from "@/types/validations/onboard";
import { TabData } from "@/hooks/generics/useDynamicTabs";

import { FormCardTabs } from "../generics/form-card-tabs";
import { AutocompleteInput } from "../generics/autocomplete-input";
import { PostcodeInput } from "../generics/form-input-postcode";
import {
  handleBirthdayChange,
  handlePostcodeLookup,
  handleSSNChange,
  PostcodeLookupResult,
} from "../generics/form-input-handlers";

const countries: { label: string; value: ISO3166Alpha2Country }[] = [
  { label: "United States", value: ISO3166Alpha2Country.US },
  { label: "United Kingdom", value: ISO3166Alpha2Country.GB },
  { label: "Germany", value: ISO3166Alpha2Country.DE },
  { label: "France", value: ISO3166Alpha2Country.FR },
];

export const FormUserDetails: React.FC<{
  onSubmit: (data: CompanyUserDetailsSchema) => void;
  initialData: CompanyUserDetailsSchema;
  updateFormData: (data: CompanyUserDetailsSchema) => void;
  userCount: number;
  accountUsers: { firstName: string; lastName: string }[];
  tabs: TabData[];
  activeTab: string;
  setActiveTab: (key: string) => void;
}> = ({ onSubmit, initialData, updateFormData, accountUsers, tabs }) => {
  const [showAddressInputs, setShowAddressInputs] = useState<boolean[]>(new Array(accountUsers.length).fill(false));
  const [birthdayInputs, setBirthdayInputs] = useState<string[]>(new Array(accountUsers.length).fill(""));
  const [ssnInputs, setSSNInputs] = useState<string[]>(new Array(accountUsers.length).fill(""));

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
  } = useForm<CompanyUserDetailsSchema>({
    resolver: zodResolver(companyUserDetailsSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    const subscription = watch((value) => {
      updateFormData(value as CompanyUserDetailsSchema);
      console.log("userDetails updated:", value);
    });

    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);

  const onFormSubmit = handleSubmit(
    (data) => {
      console.log("userDetails submitted:", data);
      onSubmit(data);
    },
    (errors) => {
      console.error("Form validation errors:", errors);
    }
  );

  const onPostcodeLookup = (result: PostcodeLookupResult | null, index: number) => {
    handlePostcodeLookup(
      result,
      setValue,
      (value) => {
        const newShowAddressInputs = [...showAddressInputs];

        newShowAddressInputs[index] = value as boolean;
        setShowAddressInputs(newShowAddressInputs);
      },
      `userDetails.${index}.registeredAddress` as const
    );
  };

  const renderTabContent = (tab: TabData, index: number) => (
    <div className="space-y-4">
      <AutocompleteInput
        about="Select the country that issued your identification"
        control={control}
        errorMessage={errors.userDetails?.[index]?.countryOfIssue?.message}
        items={countries.map((country) => ({ label: country.label, value: country.value }))}
        label="Country of Issue"
        name={`userDetails.${index}.countryOfIssue`}
        placeholder="Select a country"
        testid={`user-details-country-of-issue-input-${index}`}
      />
      <FormInput
        control={control}
        data-testid={`user-details-birthday-input-${index}`}
        errorMessage={errors.userDetails?.[index]?.birthday?.message}
        label="Birthday"
        maxLength={10}
        name={`userDetails.${index}.birthday`}
        pattern={birthdayRegex.source}
        placeholder="YYYY-MM-DD"
        value={birthdayInputs[index]}
        onChange={(e) =>
          handleBirthdayChange(
            e,
            setValue,
            (value) => {
              const newBirthdayInputs = [...birthdayInputs];

              newBirthdayInputs[index] = value as string;
              setBirthdayInputs(newBirthdayInputs);
            },
            `userDetails.${index}.birthday` as const
          )
        }
      />
      <FormInput
        control={control}
        data-testid={`user-details-ssn-input-${index}`}
        errorMessage={errors.userDetails?.[index]?.ssn?.message}
        label="Social Security"
        maxLength={11}
        name={`userDetails.${index}.ssn`}
        pattern={ssnRegex.source}
        placeholder="123-45-6789"
        value={ssnInputs[index]}
        onChange={(e) =>
          handleSSNChange(
            e,
            setValue,
            (value) => {
              const newSSNInputs = [...ssnInputs];

              newSSNInputs[index] = value as string;
              setSSNInputs(newSSNInputs);
            },
            `userDetails.${index}.ssn` as const
          )
        }
      />
      <PostcodeInput
        about="Address where the owner resides."
        control={control}
        errorMessage={errors.userDetails?.[index]?.registeredAddress?.postcode?.message}
        name={`userDetails.${index}.registeredAddress.postcode`}
        showAddressInputs={showAddressInputs[index]}
        testId={`user-details-postcode-input-${index}`}
        watchPostcode={watch(`userDetails.${index}.registeredAddress.postcode`)}
        onLookupComplete={(result) => onPostcodeLookup(result, index)}
      />
      {showAddressInputs[index] && (
        <>
          <FormInput
            control={control}
            data-testid={`user-details-street-address-1-input-${index}`}
            errorMessage={errors.userDetails?.[index]?.registeredAddress?.street1?.message}
            label="Street Address 1"
            name={`userDetails.${index}.registeredAddress.street1`}
            placeholder="123 Main St"
          />
          <FormInput
            control={control}
            data-testid={`user-details-street-address-2-input-${index}`}
            errorMessage={errors.userDetails?.[index]?.registeredAddress?.street2?.message}
            label="Street Address 2"
            name={`userDetails.${index}.registeredAddress.street2`}
            placeholder="Apt 4B"
          />
        </>
      )}
    </div>
  );

  return (
    <form onSubmit={onFormSubmit}>
      <FormCardTabs
        fields={tabs.filter((tab) => tab.key.startsWith("user-details-"))}
        renderTabContent={renderTabContent}
        renderTabTitle={(tab) => tab.title}
        title="User Details"
        onCancel={() => {}}
        onSubmit={onFormSubmit}
      />
    </form>
  );
};
