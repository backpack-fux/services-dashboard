import { useState } from "react";
import { useEffect } from "react";

import { MentionOption } from "@/types/messaging";

interface MentionListProps {
  options: MentionOption[];
  searchText: string;
  onSelect: (option: MentionOption) => void;
  position: { top: number; left: number };
  visible: boolean;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

export const MentionList: React.FC<MentionListProps> = ({ 
  options, 
  searchText, 
  onSelect, 
  position, 
  visible, 
  selectedIndex, 
  setSelectedIndex 
}) => {

  // Filter options based on search text
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchText.toLowerCase()));

  // Reset selected index when search text changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchText]);

  // Handle keyboard navigation
  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (!visible) return;

  //     switch (e.key) {
  //       case "ArrowDown":
  //         e.preventDefault();
  //         setSelectedIndex((prev) => (prev + 1) % filteredOptions.length);
  //         break;
  //       case "ArrowUp":
  //         e.preventDefault();
  //         setSelectedIndex((prev) => 
  //           prev - 1 < 0 ? filteredOptions.length - 1 : prev - 1
  //         );
  //         break;
  //       case "Enter":
  //       case "Tab":
  //         e.preventDefault();
  //         if (filteredOptions[selectedIndex]) {
  //           onSelect(filteredOptions[selectedIndex]);
  //         }
  //         break;
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);

  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, [visible, filteredOptions, selectedIndex, onSelect]);

  if (!visible) return null;

  // Check for exact match
  const exactMatch = filteredOptions.find((option) => option.label.toLowerCase() === searchText.toLowerCase());

  if (exactMatch) {
    onSelect(exactMatch);

    return null;
  }

  return (
    <div
      className="absolute z-[100] bg-charyo-500 rounded-lg shadow-lg max-h-60 overflow-y-auto 
          border border-charyo-600 w-full"
      style={{
        bottom: "100%",
        marginBottom: "8px",
        left: 0,
      }}
    >
      {filteredOptions.length === 0 ? (
        <div className="px-4 py-2 text-gray-400">No matches found</div>
      ) : (
        filteredOptions.map((option, index) => (
          <button
            key={option.id}
            className={`w-full px-4 py-2 text-left flex items-center gap-2
                focus:outline-none text-notpurple-500
                ${index === selectedIndex ? "bg-charyo-600" : "hover:bg-charyo-600"}`}
            onClick={() => onSelect(option)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            {option.icon && <span className="w-5 h-5">{option.icon}</span>}
            <span>{option.label}</span>
            {option.description && <span className="text-sm text-gray-400">{option.description}</span>}
          </button>
        ))
      )}
    </div>
  );
};