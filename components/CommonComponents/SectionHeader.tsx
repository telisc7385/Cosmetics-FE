import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  showDivider?: boolean;
  // Added new optional props for custom classes
  titleClass?: string;
  subtitleClass?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  showDivider = true,
  // Destructure the new props
  titleClass = "text-3xl font-bold", // Default classes for title
  subtitleClass = "text-base", // Default classes for subtitle
}) => {
  return (
    <div className="text-center">
      {" "}
      {/* Added px-4 for better mobile padding and text-center for alignment */}
      <h2 className={`text-[#213E5A] mb-2 ${titleClass} capitalize font-semibold`}>{title}</h2>
      {subtitle && (
        <p className={`text-[#213E5A] mb-2 ${subtitleClass}`}>{subtitle}</p>
      )}
      {/* {showDivider && <hr className=" mt-3" />} */}
    </div>
  );
};

export default SectionHeader;
