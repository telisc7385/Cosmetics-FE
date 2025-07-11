import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  showDivider?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  showDivider = true,
}) => {
  return (
    <div className="">
      <h2 className="text-[#213E5A] text-3xl font-bold mb-2">{title}</h2>
      {subtitle && <p className="text-[#213E5A] mb-2">{subtitle}</p>}
      {showDivider && <hr className="mb-3 mt-3" />}
    </div>
  );
};

export default SectionHeader;
