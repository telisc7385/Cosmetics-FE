import React from "react";
import Head from "next/head"; // For setting the page title

const TermsPage: React.FC = () => {
  return (
    <>
      {/* Head component for setting document title */}
      <Head>
        <title>Terms and Conditions - GlowUp Cosmetics</title>
      </Head>

      {/* Outer wrapper for the page background color */}
      {/* min-h-screen to ensure it takes full viewport height */}
      {/* bg-gray-50 for a very subtle off-white background */}
      <div className="min-h-screen bg-gray-50 py-12 px-2 sm:px-6 lg:px-8 flex items-center justify-center">
        {/* Main container for the terms content */}
        {/* max-w-7xl for a wider content width, mx-auto for centering */}
        {/* py-12 for increased vertical padding */}
        {/* bg-white for background, rounded-lg for rounded corners */}
        {/* shadow-md for a more subtle shadow */}
        <div className="w-full max-w-7xl bg-white shadow-md rounded-lg p-4 sm:p-10 lg:p-8">
          {/* Page Title */}
          {/* Reduced from text-4xl lg:text-5xl to text-3xl lg:text-4xl */}
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-8 text-center">
            Terms & Conditions
          </h1>

          {/* Paragraphs for terms content */}
          {/* text-base for standard paragraph text, text-gray-700 for readable dark gray text */}
          {/* leading-relaxed for comfortable line spacing, mb-6 for bottom margin */}
          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            By downloading or using the app, these terms will automatically
            apply to you – you should make sure therefore that you read them
            carefully before using the app. You’re not allowed to copy or modify
            the app, any part of the app, or our trademarks in any way. You’re
            not allowed to attempt to extract the source code of the app, and
            you also shouldn’t try to translate the app into other languages or
            make derivative versions. The app itself, and all the trademarks,
            copyright, database rights, and other intellectual property rights
            related to it, still belong to GlowUp Cosmetics.
          </p>

          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            GlowUp Cosmetics is committed to ensuring that the app is as useful
            and efficient as possible. For that reason, we reserve the right to
            make changes to the app or to charge for its services, at any time
            and for any reason. We will never charge you for the app or its
            services without making it very clear to you exactly what you’re
            paying for.
          </p>

          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            The GlowUp Cosmetics app stores and processes personal data that you
            have provided to us, to provide our Service. It’s your
            responsibility to keep your phone and access to the app secure. We
            therefore recommend that you do not jailbreak or root your phone,
            which is the process of removing software restrictions and
            limitations imposed by the official operating system of your device.
            It could make your phone vulnerable to malware/viruses/malicious
            programs, compromise your phone’s security features and it could
            mean that the GlowUp Cosmetics app won’t work properly or at all.
          </p>

          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            The app does use third-party services that declare their Terms and
            Conditions. Link to Terms and Conditions of third-party service
            providers used by the app
          </p>

          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            Google Play Services You should be aware that there are certain
            things that GlowUp Cosmetics will not take responsibility for.
            Certain functions of the app will require the app to have an active
            internet connection. The connection can be Wi-Fi or provided by your
            mobile network provider, but GlowUp Cosmetics cannot take
            responsibility for the app not working at full functionality if you
            don’t have access to Wi-Fi, and you don’t have any of your data
            allowance left.
          </p>

          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            If you’re using the app outside of an area with Wi-Fi, you should
            remember that the terms of the agreement with your mobile network
            provider will still apply. As a result, you may be charged by your
            mobile provider for the cost of data for the duration of the
            connection while accessing the app, or other third-party charges. In
            using the app, you’re accepting responsibility for any such charges,
            including roaming data charges if you use the app outside of your
            home territory (i.e. region or country) without turning off data
            roaming. If you are not the bill payer for the device on which
            you’re using the app, please be aware that we assume that you have
            received permission from the bill payer for using the app.
          </p>

          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            Along the same lines, GlowUp Cosmetics cannot always take
            responsibility for the way you use the app i.e. You need to make
            sure that your device stays charged – if it runs out of battery and
            you can’t turn it on to access beauty tips, use virtual try-on
            features, or make purchases, GlowUp Cosmetics cannot accept
            responsibility.
          </p>

          <p className="mb-6 text-base text-gray-700 leading-relaxed">
            With respect to GlowUp Cosmetics’s responsibility for your use of
            the app, when you’re using the app, it’s important to bear in mind
            that although we endeavor to ensure that it is updated and correct
            at all times, we do rely on third parties to provide information to
            us so that we can make it available to you. GlowUp Cosmetics accepts
            no liability for any loss, direct or indirect, you experience as a
            result of relying wholly on this functionality of the app.
          </p>

          <p className="mb-8 text-base text-gray-700 leading-relaxed">
            At some point, we may wish to update the app. The app is currently
            available on Android & iOS – the requirements for the both systems
            (and for any additional systems we decide to extend the availability
            of the app to) may change, and you’ll need to download the updates
            if you want to keep using the app. GlowUp Cosmetics does not promise
            that it will always update the app so that it is relevant to you
            and/or works with the Android & iOS version that you have installed
            on your device. However, you promise to always accept updates to the
            application when offered to you, We may also wish to stop providing
            the app, and may terminate use of it at any time without giving
            notice of termination to you. Unless we tell you otherwise, upon any
            termination, (a) the rights and licenses granted to you in these
            terms will end; (b) you must stop using the app, and (if needed)
            delete it from your device.
          </p>

          {/* Section Heading: Changes to Terms and Conditions */}
          {/* Reduced from text-2xl to text-xl */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            CHANGES TO THIS TERMS AND CONDITIONS
          </h2>
          <p className="mb-8 text-base text-gray-700 leading-relaxed">
            We may update our Terms and Conditions from time to time. Thus, you
            are advised to review this page periodically for any changes. We
            will notify you of any changes by posting the new Terms and
            Conditions on this page.
          </p>

          {/* Section Heading: Contact Us */}
          {/* Reduced from text-2xl to text-xl */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">CONTACT US</h2>
          <p className="text-base text-gray-700 leading-relaxed">
            If you have any questions or suggestions about our Terms and
            Conditions, do not hesitate to contact us at{" "}
            <a
              href="mailto:sales@glowupcosmetics.com"
              className="text-blue-600 hover:underline transition-colors duration-200"
            >
              sales@glowupcosmetics.com
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default TermsPage;
