import React, { useState } from "react";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";

import { FormCard } from "@/components/generics/form-card";

import { signBridgeTermsOfService } from "@/utils/merchant/signBridgeTOS";
import { signRainTermsOfService } from "@/utils/merchant/signRainToS";
import { OTPVerificationModal } from "../generics/otp-modal";
import { VerifyOTP } from "@backpack-fux/pylon-sdk";

interface AccountRegistrationProps {
  tosBridgeLink: string | null;
  kybBridgeLink: string | null;
  onCancel: () => void;
  onKYCDone: () => void;
  isRainToSAccepted: boolean;
  handleRainToSAccepted: () => Promise<void>;
  email: string;
}

export const AccountRegistration: React.FC<AccountRegistrationProps> = ({ 
  tosBridgeLink: tosLink, 
  kybBridgeLink: kybLink, 
  onCancel, 
  onKYCDone,
  isRainToSAccepted,
  handleRainToSAccepted,
  email
}) => {
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [bridgeToSAccepted, setBridgeToSAccepted] = useState(false);
  const [rainToSAccepted, setRainToSAccepted] = useState(false);
  const [companyDocsUploaded, setCompanyDocsUploaded] = useState(false);
  const [userDocsUploaded, setUserDocsUploaded] = useState(false);
  const [companyDocs, setCompanyDocs] = useState<{ [key: string]: File | null }>({
    formationDocs: null,
    entityOwnership: null,
    proofOfFunds: null,
  });
  const [userDocs, setUserDocs] = useState<{ [key: string]: File | null }>({
    photoId: null,
    proofOfFunds: null,
    proofOfResidence: null,
  });

  const handleBridgeAcceptToS = async () => {
    if (tosLink) {
      try {
        const result = await signBridgeTermsOfService(tosLink);
        if (result.signed_agreement_id) {
          setBridgeToSAccepted(true);
          setIsOTPModalOpen(true);
          console.log("Terms accepted");
        }
      } catch (error) {
        console.error("Error accepting terms:", error);
      }
    }
  };

  // Function to handle OTP verification success
  const handleOTPVerified = () => {
    setIsOTPModalOpen(false);
    console.log("OTP verification success");
    //onKYCDone();
    return null;
  };

  const handleRainAcceptToS = async () => {
    try {
      await handleRainToSAccepted();
      // You might want to show a success message or update UI here
    } catch (error) {
      console.error('Error accepting Rain ToS:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: string, isCompany: boolean) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (isCompany) {
      setCompanyDocs((prevDocs) => ({ ...prevDocs, [type]: file }));
    } else {
      setUserDocs((prevDocs) => ({ ...prevDocs, [type]: file }));
    }
  };

  const handleCompanyDocsUpload = () => {
    setCompanyDocsUploaded(true);
  };

  const handlePersonalDocsUpload = () => {
    setUserDocsUploaded(true);
  };

  const handleStartKYB = () => {
    if (kybLink) {
      onKYCDone();
      window.open(kybLink, "_blank");
      onKYCDone();
      console.log("KYB done");
    }
  };

  const handleTestRedirect = () => {
    onKYCDone();
  };

  const itemClasses = {
    base: "py-0 w-full",
    title: "font-normal text-medium",
    trigger: "px-2 py-0 data-[hover=true]:bg-default-100 rounded-lg h-14 flex items-center",
    indicator: "text-medium",
    content: "text-small px-2",
  };

  const accordionItems = [
    <AccordionItem key="1" aria-label="Bill Pay Agreement" title="Bill Pay Agreement">
      <p className="mb-4">
        At Bridge, we are advancing the accessibility of stablecoins and stablecoin-based applications. &quot;Stablecoins&quot; are a special type of cryptographic digital asset that can be redeemed at face value for government-issued money (“Fiat Currency”). By clicking &apos;Accept&apos;, you agree to Bridge&apos;s{" "}
        <Link href="https://www.bridge.xyz/legal" target="_blank">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="https://www.bridge.xyz/legal?tab=eea-privacy-policy" target="_blank">
          Privacy Policy
        </Link>
      </p>
      <Button
        className="w-full bg-ualert-500 text-notpurple-100"
        isDisabled={bridgeToSAccepted || !tosLink}
        onClick={handleBridgeAcceptToS}
      >
        {bridgeToSAccepted ? "Terms Accepted" : "Accept Terms"}
      </Button>
    </AccordionItem>,

    <AccordionItem key="2" aria-label="Card Program Agreement" title="Card Program Agreement">
      <p className="mb-4">
        The Rain Corporate Card (&quot;Rain Card&quot;) is a business card issued to the Account holder under the Rain Platform
        Agreement and the Rain Corporate Card Agreement. The Rain Corporate Card is issued by Third National (&quot;Issuer&quot;).
        <Link href="https://www.raincards.xyz/legal/docs/corporate-card-user-agreement" target="_blank">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="https://www.raincards.xyz/legal/docs/privacy-policy" target="_blank">
          Privacy Policy
        </Link>
      </p>
      <Button
        className="w-full bg-ualert-500 text-notpurple-100"
        isDisabled={isRainToSAccepted || !tosLink}
        onClick={handleRainAcceptToS}
      >
        {isRainToSAccepted ? "Terms Accepted" : "Accept Terms"}
      </Button>
    </AccordionItem>,

    <AccordionItem key="3" aria-label="Company Docs" title="Company Documents">
      <p className="mb-4">Upload the following company documents:</p>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label htmlFor="formationDocs" className="w-1/3 text-right font-medium">Formation Docs:</label>
          <input 
            id="formationDocs"
            type="file" 
            className="file-input" 
            onChange={(e) => handleFileChange(e, 'formationDocs', true)} 
          />
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="entityOwnership" className="w-1/3 text-right font-medium">Entity Ownership:</label>
          <input 
            id="entityOwnership"
            type="file" 
            className="file-input" 
            onChange={(e) => handleFileChange(e, 'entityOwnership', true)} 
          />
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="proofOfFunds" className="w-1/3 text-right font-medium">Proof of Funds:</label>
          <input 
            id="proofOfFunds"
            type="file" 
            className="file-input" 
            onChange={(e) => handleFileChange(e, 'proofOfFunds', true)} 
          />
        </div>
      </div>
    </AccordionItem>,

    <AccordionItem key="4" aria-label="Personal Docs" title="Personal Documents">
      <p className="mb-4">Upload the following personal documents:</p>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label htmlFor="photoId" className="w-1/3 text-right font-medium">Photo ID:</label>
          <input 
            id="photoId"
            type="file" 
            className="file-input" 
            onChange={(e) => handleFileChange(e, 'photoId', false)} 
          />
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="proofOfFunds" className="w-1/3 text-right font-medium">Proof of Funds:</label>
          <input 
            id="proofOfFunds"
            type="file" 
            className="file-input" 
            onChange={(e) => handleFileChange(e, 'proofOfFunds', false)} 
          />
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="proofOfResidence" className="w-1/3 text-right font-medium">Proof of Residence:</label>
            <input 
            id="proofOfResidence"
            type="file" 
            className="file-input" 
            onChange={(e) => handleFileChange(e, 'proofOfResidence', false)} 
          />
        </div>
      </div>
    </AccordionItem>,
  ];
  
  if (bridgeToSAccepted) {
    accordionItems.push(
      <AccordionItem key="5" aria-label="KYB Verification" title="KYB Verification">
        <p className="mb-4">Please complete your KYB verification by clicking the button below:</p>
        <Button className="w-full bg-ualert-500 text-notpurple-100" onClick={handleStartKYB}>
          Start KYB Verification
        </Button>
      </AccordionItem>
    );
  }

  return (
    <>
    <FormCard title="Register Account">
      <Accordion
        showDivider={false}
        className="p-2 flex flex-col gap-1 w-full"
        variant="shadow"
        itemClasses={itemClasses}
      >
        {accordionItems}
      </Accordion>
      <div className="flex justify-between mt-4">
        <Button className="text-notpurple-500" variant="light" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="text-notpurple-500" variant="light" onClick={handleTestRedirect}>
          Test Redirect
        </Button>
      </div>
    </FormCard>
    {isOTPModalOpen && (
      <OTPVerificationModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerified={handleOTPVerified}
        email={email}
        />
      )}
    </>
  );
};