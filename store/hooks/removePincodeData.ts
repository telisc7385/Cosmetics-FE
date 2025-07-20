// src/utils/removePincodeData.ts
export const handleRemovePincode = () => {
  if (typeof window !== "undefined") {
    // Remove from localStorage
    localStorage.removeItem("verifiedPincode");
    localStorage.removeItem("verifiedCity");
    localStorage.removeItem("verifiedState");
    localStorage.removeItem("verifiedShipping");
    localStorage.removeItem("verifiedTax");
    localStorage.removeItem("verifiedTaxType");

    // Remove from sessionStorage
    sessionStorage.removeItem("verifiedPincode");
    sessionStorage.removeItem("verifiedCity");
    sessionStorage.removeItem("verifiedState");
    sessionStorage.removeItem("verifiedShipping");
    sessionStorage.removeItem("verifiedTax");
    sessionStorage.removeItem("verifiedTaxType");

    console.log("Pincode data cleared from both localStorage and sessionStorage.");
  }
};