import { useState } from "react";
import { Tab, Tabs } from "@nextui-org/tabs";
import { PlusIcon } from "lucide-react";

import { cardServicesConfig } from "@/config/tabs";
import { ResponsiveButton } from "@/components/generics/responsive-button";
import CreateCardModal from "@/components/card-issuance/card-create";

import CardListTable from "./card-list";
import TransactionListTable from "./transactions";

type CardServicesTabsProps = {
  handleSubTabChange: (key: string) => void;
};

export default function CardServicesTabs({ handleSubTabChange }: CardServicesTabsProps) {
  const [selectedService, setSelectedService] = useState<string>(cardServicesConfig[0].id);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case "transactions":
        return <TransactionListTable />;
      case "card-list":
        return <CardListTable />;
      default:
        return <div>Tab content not found</div>;
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <Tabs
          aria-label="Service options"
          classNames={{
            tabList: "border-small",
          }}
          selectedKey={selectedService}
          variant="bordered"
          onSelectionChange={(key) => setSelectedService(key as string)}
        >
          {cardServicesConfig.map((tab) => (
            <Tab key={tab.id} title={tab.label} />
          ))}
        </Tabs>
        {selectedService === "card-list" && (
          <ResponsiveButton icon={PlusIcon} label="Create Card" onPress={() => setIsCreateModalOpen(true)} />
        )}
      </div>
      <div className="mt-4">{renderTabContent(selectedService)}</div>
      <CreateCardModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}
