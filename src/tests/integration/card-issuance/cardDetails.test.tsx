import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import pylon from "@/libs/pylon-sdk";
import { CardLimitFrequency, CardStatus, Merchant } from "@backpack-fux/pylon-sdk";
import CardDetailsModal from "@/components/card-issuance/card-details";

vi.mock("@/libs/pylon-sdk", () => ({
  default: {
    decryptVirtualCard: vi.fn().mockResolvedValue({
      decryptedCvc: "123",
      decryptedPan: "4242424242424242",
      then() {},
      catch() {},
    }),
  },
}));

vi.mock("@backpack-fux/pylon-sdk", () => ({
  Merchant: vi.fn(() => ({
    updateRainCard: vi.fn(),
  })),
  CardStatus: {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
  },
  CardLimitFrequency: {
    MONTH: "MONTH",
    WEEK: "WEEK",
  },
  CardShippingMethod: {
    STANDARD: "STANDARD",
    EXPRESS: "EXPRESS",
    INTERNATIONAL: "INTERNATIONAL",
  },
}));

describe("CardDetailsModal", () => {
  const mockOnClose = vi.fn();
  const mockCard: any = {
    id: "card-123",
    displayName: "Test Card",
    status: CardStatus.ACTIVE,
    limit: 1000,
    limitFrequency: CardLimitFrequency.MONTH,
    lastFour: "4242",
    expirationMonth: "12",
    expirationYear: "2025",
    cardOwner: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    },
    type: "VIRTUAL",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchantId: "merchant-123",
    cardType: "VIRTUAL",
    cardBin: "424242",
    brand: "VISA",
    fundingType: "DEBIT",
    cardProduct: "VIRTUAL_DEBIT",
    memo: "",
    metadata: {},
    statusReason: null,
    webhookUrl: null,
    cardDesignId: null,
    cardDesignUrl: null,
    avatar: undefined,
    holder: "John Doe",
  };

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    card: mockCard,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial Render", () => {
    it("should render card details correctly", () => {
      render(<CardDetailsModal {...defaultProps} />);

      expect(screen.getByText("Card Details")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test Card")).toBeInTheDocument();
      expect(screen.getByText("ACTIVE")).toBeInTheDocument();
      expect(screen.getByText("VIRTUAL")).toBeInTheDocument();
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    });

    it("should fetch virtual card details on mount", async () => {
      render(<CardDetailsModal {...defaultProps} />);

      await waitFor(() => {
        expect(pylon.decryptVirtualCard).toHaveBeenCalledWith(defaultProps.card.id);
      });
    });

    it("should handle decryption error gracefully", async () => {
      vi.mocked(pylon.decryptVirtualCard).mockRejectedValueOnce(new Error("Decryption failed"));
      const consoleSpy = vi.spyOn(console, "log");

      render(<CardDetailsModal {...defaultProps} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });
    });
  });

  describe("Edit Mode", () => {
    it("should enter edit mode when Edit button is clicked", async () => {
      render(<CardDetailsModal {...defaultProps} />);

      fireEvent.click(screen.getByText("Edit"));

      await waitFor(() => {
        expect(screen.getByText("Edit card - Test Card")).toBeInTheDocument();
        expect(screen.getByTestId("card-limitAmount")).toBeInTheDocument();
        expect(screen.getByTestId("card-limitFrequency")).toBeInTheDocument();
        expect(screen.getByTestId("card-status")).toBeInTheDocument();
      });
    });

    it("should handle successful card update", async () => {
      const mockUpdateRainCard = vi
        .fn((d) => {
          return d;
        })
        .mockResolvedValueOnce({});
      //   @ts-ignore
      vi.mocked(Merchant).mockImplementation(() => ({
        updateRainCard: mockUpdateRainCard,
      }));

      render(<CardDetailsModal {...defaultProps} />);

      fireEvent.click(screen.getByText("Edit"));

      fireEvent.change(screen.getByTestId("card-limitAmount"), {
        target: { value: "2000" },
      });

      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(mockUpdateRainCard).toHaveBeenCalledWith({
          cardId: "card-123",
          limit: {
            amount: 2000,
            frequency: "MONTH",
          },
          status: undefined,
        });
      });
    });

    it("should handle update error", async () => {
      const mockError = new Error("Update failed");
      const mockUpdateRainCard = vi.fn().mockRejectedValueOnce(mockError);
      //   @ts-ignore
      vi.mocked(Merchant).mockImplementation(() => ({
        updateRainCard: mockUpdateRainCard,
      })) as any;

      render(<CardDetailsModal {...defaultProps} />);

      fireEvent.click(screen.getByText("Edit"));
      fireEvent.change(screen.getByTestId("card-limitAmount"), {
        target: { value: "2000" },
      });
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(screen.getByText("Update failed")).toBeInTheDocument();
      });
    });
  });

  describe("Physical Card Details", () => {
    const physicalCard = {
      ...mockCard,
      cardShippingDetails: {
        street1: "123 Main St",
        city: "New York",
        state: "NY",
        country: "US",
      },
      type: "PHYSICAL",
      cardType: "PHYSICAL",
    };

    it("should render physical card shipping details", () => {
      render(<CardDetailsModal {...defaultProps} card={physicalCard} />);

      expect(screen.getByText("PHYSICAL")).toBeInTheDocument();
      expect(screen.getByDisplayValue(/123 Main St/)).toBeInTheDocument();
    });
  });

  describe("Modal Actions", () => {
    it("should call onClose when Close button is clicked", () => {
      render(<CardDetailsModal {...defaultProps} />);

      fireEvent.click(screen.getByText("Close"));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should exit edit mode when Cancel is clicked", async () => {
      render(<CardDetailsModal {...defaultProps} />);

      fireEvent.click(screen.getByText("Edit"));
      expect(screen.getByText("Edit card - Test Card")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Cancel"));

      await waitFor(() => {
        expect(screen.getByText("Card Details")).toBeInTheDocument();
      });
    });
  });
});