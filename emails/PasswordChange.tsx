import {
    Body,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface PasswordChangeEmailProps {
    name: string;
    customerEmail: string;
    changedAt?: string;
}

export const PasswordChangeEmail = ({
    name,
    customerEmail,
    changedAt,
}: PasswordChangeEmailProps) => {
    const previewText = `Your Grodify account password has been changed.`;

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
                            🔐 Password Changed
                        </Heading>

                        <Text className="text-white text-[14px] leading-[24px]">
                            Hello {name},
                        </Text>
                        <Text className="text-white text-[14px] leading-[24px]">
                            Your <strong>Grodify</strong> account password has been successfully changed.
                        </Text>

                        {/* Warning Box */}
                        <Section className="bg-[#2a1a1a] border-l-4 border-red-600 rounded-lg p-[20px] my-[24px]">
                            <Text className="text-[#ffb3b3] text-[13px] leading-[22px] m-0">
                                ⚠️ <strong>Did not change your password?</strong>
                            </Text>
                            <Text className="text-[#ffb3b3] text-[13px] leading-[22px] m-0 mt-[8px]">
                                If you did not make this change, your account may be at risk. Please contact us immediately.
                            </Text>
                        </Section>

                        {/* Account Info */}
                        <Section className="bg-[#1a1a1a] rounded-lg p-[20px] my-[24px]">
                            <Row>
                                <Column>
                                    <Text className="text-[#666666] text-[12px] uppercase mb-1">Account Email</Text>
                                    <Text className="font-bold text-[14px] m-0 text-white">{customerEmail}</Text>
                                </Column>
                            </Row>
                            {changedAt && (
                                <>
                                    <Hr className="border border-solid border-[#eaeaea] my-[16px]" />
                                    <Row>
                                        <Column>
                                            <Text className="text-[#666666] text-[12px] uppercase mb-1">Changed On</Text>
                                            <Text className="font-bold text-[14px] m-0 text-white">{changedAt}</Text>
                                        </Column>
                                    </Row>
                                </>
                            )}
                        </Section>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Link
                                href="https://grodify.com/contact"
                                className="bg-[#000000] rounded-full text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
                            >
                                Contact Support
                            </Link>
                        </Section>

                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            If this was you, no action is needed. Stay safe! 🔒 For help, contact us at{" "}
                            <Link href="mailto:admin@grodify.com" className="text-blue-600 no-underline">
                                admin@grodify.com
                            </Link>.
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

export default PasswordChangeEmail;