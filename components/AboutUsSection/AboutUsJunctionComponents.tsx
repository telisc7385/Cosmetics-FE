import React from "react";
import AboutUsBannerComponent from "./AboutUsBannerComponent";
import OurMissionComponent from "./OurMission";
import NewsletterSignup from "../ClientsideComponent/NewsletterSignup/NewsletterSignup";
import CounterComponent from "./CounterComponent";
import OurStory from "./OurStory";
import WhyChooseUs from "./WhyChooseUs";
import OurVision from "./OurVision";
import Quote from "./Quote";
import TestimonialsSection from "@/components/TestimonialsSection/TestimonialsSection";
import { getTestimonials } from "@/api/fetchWhyChooseUs";
import OurValues from "./OurValues";
import OurMission from "./OurMission";


type Props = {
  sectionData: any;
};

const testimonials = await getTestimonials(); // Assuming this function fetches testimonials

const AboutUsJunctionComponents = ({ sectionData }: Props) => {
  console.log("sectionData", sectionData);
  return (
    <div className="flex flex-col gap-6 md:gap-10">
      {sectionData.map((section: any) => {
        switch (section?.section_name) {
          case "banner":
            return (
              <div key={section.id}>
                <AboutUsBannerComponent BannerData={section} />
              </div>
            );

          case "our_story":
            return (
              <div key={section.id}>
                <OurStory sectionData={section} />
              </div>
            );


          case "superior_quality":
            return (
              <div key={section.id}>
                <Quote sectionData={section} />
              </div>
            );
          case "our_mission":
            return (
              <div key={section.id}>
                <OurMission sectionData={section} />
              </div>
            );
          case "our_vision":
            return (
              <div key={section.id}>
                <OurVision sectionData={section} />
              </div>
            );
          // case "inner_banner":
          //   return (
          //     <div key={section.id}>
          //       <AboutUsInnerBanner sectionData={section} />
          //     </div>
          //   );
          case "counter":
            return (
              <div key={section.id}>
                <CounterComponent sectionData={section} />
              </div>
            );


          // case "very_close":
          //   return (
          //     <div key={section.id}>
          //       <VeryCloseSectionComponent sectionData={section} />
          //     </div>
          //   );
          // case "quality_and_Innovation":
          //   return (
          //     <div key={section.id}>
          //       <QualityAndInnovationComponent sectionData={section} />
          //     </div>
          //   );
          case "our_commitment":
            return (
              <div key={section.id}>
                <OurValues sectionData={section} />
              </div>
            );
          // case "our_journey":
          //   return (
          //     <div key={section.id}>
          //       <JourneyTimeline sectionData={section} />
          //     </div>
          //   );
          case "about_glam":
            return (
              <div key={section.id}>
                <WhyChooseUs sectionData={section} />
              </div>
            );
        }
      })}
      <TestimonialsSection testimonials={testimonials} />
      <NewsletterSignup />
    </div>
  );
};

export default AboutUsJunctionComponents;
