import { getAboutUsData } from "@/api/aboutUsApi";
import AboutUsJunctionComponents from "@/components/AboutUsSection/AboutUsJunctionComponents";

import React from "react";

const page = async () => {
  const response: any = await getAboutUsData();
  // console.log("sectionData", response);

  return (
    <div>
      <AboutUsJunctionComponents sectionData={response.results} />
    </div>
  );
};

export default page;
