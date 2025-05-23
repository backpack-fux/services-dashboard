"use client";

import { Checkbox } from "@heroui/checkbox";
import { useFormContext } from "react-hook-form";
import { Link } from "@heroui/link";
import { ExternalLink } from "lucide-react";

const CustomCheckIcon = (props: { className: string }) => (
  <svg
    aria-hidden="true"
    className={props.className}
    fill="none"
    height="14"
    viewBox="0 0 24 24"
    width="14"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
  </svg>
);

export const TermsStep = () => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const handleAcceptTerms = (checked: boolean) => {
    setValue("acceptedTerms", checked, { shouldValidate: true });
  };

  return (
    <div className="mb-8 space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-3">
          <Checkbox
            {...register("acceptedTerms")}
            classNames={{
              base: "max-w-full",
              wrapper:
                "before:border-primary group-data-[selected=true]:before:border-primary group-data-[selected=true]:before:bg-primary",
              label: "hidden",
            }}
            icon={<CustomCheckIcon className="text-primary-foreground" />}
            size="lg"
            onValueChange={handleAcceptTerms}
          />

          <div className={`flex flex-wrap gap-1 ${errors?.acceptedTerms ? "text-danger" : "text-foreground/90"}`}>
            <span className="text-foreground/90">I acknowledge and accept the</span>
            <Link
              isExternal
              className="text-primary font-medium inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
              href="https://monetic.xyz/terms-of-service"
              onClick={(e) => e.stopPropagation()}
            >
              terms of service
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span className="text-foreground/90">as well as</span>
            <Link
              isExternal
              className="text-primary font-medium inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
              href="https://monetic.xyz/privacy-policy"
              onClick={(e) => e.stopPropagation()}
            >
              privacy policy
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span className="text-foreground/90">
              for Monetic, including but not limited to, the Rain Card and Bill Pay services.
            </span>
          </div>
        </div>
      </div>
      {errors?.acceptedTerms && <p className="text-danger text-sm">{errors.acceptedTerms.message?.toString()}</p>}
    </div>
  );
};
