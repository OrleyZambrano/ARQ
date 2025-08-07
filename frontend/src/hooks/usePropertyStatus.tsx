import { useState } from "react";
import { PropertyStatusManager } from "../utils/propertyStatus";

export function usePropertyStatus() {
  const [manager] = useState(() => PropertyStatusManager.getInstance());
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (
    propertyId: string,
    newStatus:
      | "draft"
      | "active"
      | "paused"
      | "expired"
      | "sold"
      | "under_review"
      | "rejected",
    reason?: string,
    notes?: string
  ) => {
    setIsLoading(true);
    try {
      const result = await manager.updatePropertyStatus(
        propertyId,
        newStatus,
        reason,
        notes
      );
      return result;
    } catch (error) {
      console.error("Error in usePropertyStatus:", error);
      return { success: false, message: "Error interno del sistema" };
    } finally {
      setIsLoading(false);
    }
  };

  const getValidTransitions = async (propertyId: string) => {
    try {
      const result = await manager.getValidTransitions(propertyId);
      return result;
    } catch (error) {
      console.error("Error getting valid transitions:", error);
      return [];
    }
  };

  const getHistory = async (propertyId: string) => {
    try {
      const result = await manager.getStatusHistory(propertyId);
      return result;
    } catch (error) {
      console.error("Error getting status history:", error);
      return [];
    }
  };

  const getCurrentStatus = async (propertyId: string) => {
    try {
      const result = await manager.getCurrentStatus(propertyId);
      return result;
    } catch (error) {
      console.error("Error getting current status:", error);
      return null;
    }
  };

  const validateTransition = async (
    propertyId: string,
    newStatus:
      | "draft"
      | "active"
      | "paused"
      | "expired"
      | "sold"
      | "under_review"
      | "rejected"
  ) => {
    try {
      const result = await manager.validateStatusTransition(
        propertyId,
        newStatus
      );
      return result;
    } catch (error) {
      console.error("Error validating transition:", error);
      return { valid: false, message: "Error interno del sistema" };
    }
  };

  return {
    updateStatus,
    getValidTransitions,
    getHistory,
    getCurrentStatus,
    validateTransition,
    isLoading,
  };
}
