import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface RegistrationVerificationEmailProps {
  name: string;
  verificationUrl: string;
}

export const RegistrationVerificationEmail = ({
  name,
  verificationUrl,
}: RegistrationVerificationEmailProps) => {
  const previewText = "Your Grodify email has been verified successfully.";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-black my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#333333] rounded my-[40px] mx-auto p-[20px] w-[465px] bg-[#111111]">
            <Section className="mt-[32px]">
              <Img
                src="https://grodify.com/logo.png"
                width="120"
                height="40"
                alt="Grodify"
                className="mx-auto my-0"
              />
            </Section>

            <Heading className="text-white text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Email Verified
            </Heading>

            <Text className="text-white text-[14px] leading-[24px]">Hello {name},</Text>
            <Text className="text-white text-[14px] leading-[24px]">
              Your email address has been verified successfully. Your Grodify account is now
              active.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                href={verificationUrl}
                className="bg-[#000000] rounded-full text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
              >
                Go To Profile
              </Link>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you did not verify this account, please contact{" "}
              <Link href="mailto:admin@grodify.com" className="text-blue-600 no-underline">
                admin@grodify.com
              </Link>
              .
            </Text>

            <Text className="text-[#999999] text-[10px] text-center mt-[24px]">
              © 2024 Grodify. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default RegistrationVerificationEmail;
