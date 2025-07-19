export const handleRemovePincode = () => {
  localStorage.removeItem("verifiedPincode");
  localStorage.removeItem("verifiedCity");
  localStorage.removeItem("verifiedState");
  localStorage.removeItem("verifiedShipping");
  localStorage.removeItem("verifiedTax");
  localStorage.removeItem("verifiedTaxType");
};
