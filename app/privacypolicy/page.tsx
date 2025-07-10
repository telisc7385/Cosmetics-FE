import React from "react";
import Head from "next/head";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - GlowUp Cosmetics</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-2 sm:px-6 lg:px-8 flex items-center justify-center">
        {/* Main container for the terms content */}
        {/* max-w-4xl for a wider content width on larger screens, mx-auto for centering */}
        {/* py-12 for increased vertical padding */}
        {/* bg-white for background, rounded-lg for rounded corners */}
        {/* shadow-md for a subtle shadow */}
        <div className="w-full max-w-7xl bg-white shadow-md rounded-lg p-4 sm:p-10 lg:p-12">
          {/* Page Title */}
          {/* Reduced from text-4xl lg:text-5xl to text-3xl lg:text-4xl */}
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-8 text-center">
            Privacy Statement
          </h1>

          {/* Section Heading */}
          {/* Reduced from text-2xl to text-xl */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            SECTION 1 – WHAT DO WE DO WITH YOUR INFORMATION?
          </h2>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            When you purchase something from our store, as part of the buying
            and selling process, we collect the personal information you give us
            such as your name, address and email address. When you browse our
            store, we also automatically receive your computer’s internet
            protocol (IP) address in order to provide us with information that
            helps us learn about your browser and operating system. Email
            marketing (if applicable): With your permission, we may send you
            emails about our store, new products and other updates.
          </p>

          {/* Section Heading */}
          {/* Reduced from text-2xl to text-xl */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            SECTION 2 – CONSENT
          </h2>
          {/* Sub-heading */}
          {/* Reduced from text-xl to text-lg */}
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            How do you get my consent?
          </h3>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            When you provide us with personal information to complete a
            transaction, verify your credit card, place an order, arrange for a
            delivery or return a purchase, we imply that you consent to our
            collecting it and using it for that specific reason only. If we ask
            for your personal information for a secondary reason, like
            marketing, we will either ask you directly for your expressed
            consent, or provide you with an opportunity to say no.
          </p>

          {/* Sub-heading */}
          {/* Reduced from text-xl to text-lg */}
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            How do I withdraw my consent?
          </h3>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            If after you opt-in, you change your mind, you may withdraw your
            consent for us to contact you, for the continued collection, use or
            disclosure of your information, at anytime, by contacting us at{" "}
            <a
              href="mailto:sales@glowupcosmetics.com"
              className="text-blue-600 hover:underline transition-colors duration-200"
            >
              sales@glowupcosmetics.com
            </a>
            .
          </p>

          {/* Sub-heading */}
          {/* Reduced from text-xl to text-lg */}
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Location Access:
          </h3>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            The app needs access to the user’s location so it can get the sales
            user’s location. In some cases, you provide your location
            information to us directly (e.g. when you provide us with a delivery
            address). In other cases, we may collect your location through GPS,
            WiFi, wireless network triangulation or other methods, or we may
            otherwise infer your location based on other information we collect.
            (For example, we can approximate your location by your IP Address.)
            We use location information to customize content on our Platform
            and/or Services (e.g., show you the Merchants that will deliver to
            your location and show you relevant Perks), facilitate order and
            delivery Services, detect and prevent fraud, and measure traffic and
            analytics on the Platform and/or Services. If you have previously
            opted into GlowUp Cosmetics’s collection and use of location-based
            information through our mobile application, we may collect and store
            the precise location of your device when the app is running in the
            foreground or background of your device. You may opt-out by
            adjusting the settings on your mobile device. We also use the Google
            Maps API to gather information about your location. Google uses
            various technologies to determine your location, including IP
            address, GPS and other sensors that may, for example, provide Google
            with information on nearby devices, WiFi access points and cell
            towers.
          </p>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            We typically collect the foregoing generated and/or automatically
            collected information through a variety of tracking technologies,
            including cookies, Flash objects, web beacons, embedded scripts,
            mobile SDKs, location-identifying technologies, and similar
            technology (collectively, “tracking technologies”), and we may use
            third-party partners or services to assist with this effort.
            Information we collect automatically about you or your device may be
            combined with other personal information we collect directly. For
            information about our and our third-party partners’ use of cookies
            and related technologies to collect information automatically, and
            choices you may have in relation to its collection.
          </p>

          {/* Section Heading */}
          {/* Reduced from text-2xl to text-xl */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            SECTION 3 – DISCLOSURE
          </h2>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            We may disclose your personal information if we are required by law
            to do so or if you violate our Terms of Service.
          </p>

          {/* Sub-heading */}
          {/* Reduced from text-xl to text-lg */}
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment:</h3>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            If you choose a direct payment gateway to complete your purchase,
            then GlowUp Cosmetics stores your credit card data. It is encrypted
            through the Payment Card Industry Data Security Standard (PCI-DSS).
            Your purchase transaction data is stored only as long as is
            necessary to complete your purchase transaction. After that is
            complete, your purchase transaction information is deleted. All
            direct payment gateways adhere to the standards set by PCI-DSS as
            managed by the PCI Security Standards Council, which is a joint
            effort of brands like Visa, Mastercard, American Express and
            Discover. PCI-DSS requirements help ensure the secure handling of
            credit card information by our store and its service providers.
          </p>

          {/* Section 4 is missing in the provided text, so skipping to 5 */}
          {/* Section Heading */}
          {/* Reduced from text-2xl to text-xl */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            SECTION 5 – THIRD-PARTY SERVICES
          </h2>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            In general, the third-party providers used by us will only collect,
            use and disclose your information to the extent necessary to allow
            them to perform the services they provide to us. However, certain
            third-party service providers, such as payment gateways and other
            payment transaction processors, have their own privacy policies in
            respect to the information we are required to provide to them for
            your purchase-related transactions. For these providers, we
            recommend that you read their privacy policies so you can understand
            the manner in which your personal information will be handled by
            these providers. In particular, remember that certain providers may
            be located in or have facilities that are located a different
            jurisdiction than either you or us. So if you elect to proceed with
            a transaction that involves the services of a third-party service
            provider, then your information may become subject to the laws of
            the jurisdiction(s) in which that service provider or its facilities
            are located. As an example, if you are located in Canada and your
            transaction is processed by a payment gateway located in the United
            States, then your personal information used in completing that
            transaction may be subject to disclosure under United States
            legislation, including the Patriot Act. Once you leave our store’s
            website or are redirected to a third-party website or application,
            you are no longer governed by this Privacy Policy or our website’s
            Terms of Service.
          </p>

          {/* Sub-heading */}
          {/* Reduced from text-xl to text-lg */}
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Links</h3>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            When you click on links on our store, they may direct you away from
            our site. We are not responsible for the privacy practices of other
            sites and encourage you to read their privacy statements.
          </p>

          {/* Section Heading */}
          {/* Reduced from text-2xl to text-xl */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            SECTION 6 – SECURITY
          </h2>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            To protect your personal information, we take reasonable precautions
            and follow industry best practices to make sure it is not
            inappropriately lost, misused, accessed, disclosed, altered or
            destroyed. If you provide us with your credit card information, the
            information is encrypted using secure socket layer technology (SSL)
            and stored with a AES-256 encryption. Although no method of
            transmission over the Internet or electronic storage is 100% secure,
            we follow all PCI-DSS requirements and implement additional
            generally accepted industry standards.
          </p>

          {/* Section Heading */}
          {/* Reduced from text-2xl to text-xl */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            SECTION 7 – COOKIES
          </h2>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            Cookies are files with a small amount of data that are commonly used
            as anonymous unique identifiers. These are sent to your browser from
            the websites that you visit and are stored on your device’s internal
            memory.
          </p>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            This Service does not use these “cookies” explicitly. However, the
            app may use third-party code and libraries that use “cookies” to
            collect information and improve their services. You have the option
            to either accept or refuse these cookies and know when a cookie is
            being sent to your device. If you choose to refuse our cookies, you
            may not be able to use some portions of this Service.
          </p>

          {/* Section Heading */}
          {/* Reduced from text-2xl to text-xl */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            SECTION 8 – AGE OF CONSENT
          </h2>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            By using this site, you represent that you are at least the age of
            majority in your state or province of residence, or that you are the
            age of majority in your state or province of residence and you have
            given us your consent to allow any of your minor dependents to use
            this site.
          </p>

          {/* Section Heading */}
          {/* Reduced from text-2xl to text-xl */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            SECTION 9 – CHANGES TO THIS PRIVACY POLICY
          </h2>
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            We reserve the right to modify this privacy policy at any time, so
            please review it frequently. Changes and clarifications will take
            effect immediately upon their posting on the website. If we make
            material changes to this policy, we will notify you here that it has
            been updated, so that you are aware of what information we collect,
            how we use it, and under what circumstances, if any, we use and/or
            disclose it. If our store is acquired or merged with another
            company, your information may be transferred to the new owners so
            that we may continue to sell products to you.
          </p>

          {/* Section Heading */}
          {/* Reduced from text-2xl to text-xl */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            QUESTIONS AND CONTACT INFORMATION
          </h2>
          <p className="text-base text-gray-700 leading-relaxed">
            If you would like to: access, correct, amend or delete any personal
            information we have about you, register a complaint, or simply want
            more information contact our Privacy Compliance Officer at{" "}
            <a
              href="mailto:sales@glowupcosmetics.com"
              className="text-blue-600 hover:underline transition-colors duration-200"
            >
              sales@glowupcosmetics.com
            </a>{" "}
            and contact us on{" "}
            <a
              href="tel:+91-22-29277276"
              className="text-blue-600 hover:underline transition-colors duration-200"
            >
              +91-22-29277276
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
