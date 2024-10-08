"use client";

import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { useState } from "react";
import useAccountContracts from "@/hooks/account-contracts/useAccountContracts";
import AddFundsModal from "@/components/account-contract/add-funds";

export default function AvailableCard() {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const { available, isLoading } = useAccountContracts();

  return (
    <>
      <Card className="flex-grow bg-charyo-500/60">
        <CardHeader className="flex-col items-start px-4 pt-2 pb-0">
          <p className="text-tiny uppercase font-bold">Available</p>
          <small className="text-default-500">Available to spend</small>
        </CardHeader>
        <CardBody className="py-2">
          <h4 className="font-bold text-large pb-2">
            {isLoading ? "Loading..." : `$${available.toFixed(2)}`}
          </h4>
          <div className="flex gap-2">
            <Button
              className="w-full bg-charyo-200 text-notpurple-500"
              size="sm"
              onPress={() => setIsAddFundsOpen(true)}
            >
              Add Funds
            </Button>
          </div>
        </CardBody>
      </Card>

      <AddFundsModal isOpen={isAddFundsOpen} onClose={() => setIsAddFundsOpen(false)} />
    </>
  );
}