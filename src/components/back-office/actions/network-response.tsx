import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";

interface NetworkResponseProps {
  isOpen: boolean;
  onClose: () => void;
  response: {
    transactionId: string;
    responseStatus: string;
    responseCode: string;
    riskScore: number;
    timestamp: string;
  };
}

export function NetworkResponse({ isOpen, onClose, response }: NetworkResponseProps) {
  return (
    <Modal isOpen={isOpen} size="lg" onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col items-center">
              <h2 className="text-2xl font-bold">Network Response</h2>
              <p className="text-sm text-gray-500">
                Transaction ID: {response.transactionId}
              </p>
            </ModalHeader>
            <Divider />
            <ModalBody>
              <div className="space-y-4 font-mono">
                <div className="flex justify-between">
                  <span>Response Status:</span>
                  <span
                    className={`font-bold ${
                      response.responseStatus === "Approved"
                        ? "text-green-500"
                        : response.responseStatus === "Pending"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {response.responseStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Response Code:</span>
                  <span>{response.responseCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Risk Score:</span>
                  <span
                    className={`font-bold ${
                      response.riskScore < 50
                        ? "text-green-500"
                        : response.riskScore < 75
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {response.riskScore}
                  </span>
                </div>
                <Divider />
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <span>{response.timestamp}</span>
                </div>
              </div>
            </ModalBody>
            <Divider />
            <ModalFooter className="flex justify-center">
              <Button color="primary" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}