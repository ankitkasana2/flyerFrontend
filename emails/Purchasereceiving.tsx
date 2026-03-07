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

interface PurchaseReceivingEmailProps {
    name: string;
    orderId: string;
    flyerName: string;
    total: string;
    date: string;
    downloadUrl?: string;
}

export const PurchaseReceivingEmail = ({
    name,
    orderId,
    flyerName,
    total,
    date,
    downloadUrl,
}: PurchaseReceivingEmailProps) => {
    const previewText = `Your Grodify purchase #${orderId} has been received!`;

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
                            📦 Purchase Received!
                        </Heading>

                        <Text className="text-white text-[14px] leading-[24px]">
                            Hello {name},
                        </Text>
                        <Text className="text-white text-[14px] leading-[24px]">
                            We have successfully received your purchase. Our team will start working on your order shortly and you will be notified once it is ready.
                        </Text>

                        <Section className="bg-[#1a1a1a] rounded-lg p-[20px] my-[24px]">
                            <Row>
                                <Column>
                                    <Text className="text-[#666666] text-[12px] uppercase mb-1">Order ID</Text>
                                    <Text className="font-bold text-[14px] m-0 text-white">#{orderId}</Text>
                                </Column>
                                <Column>
                                    <Text className="text-[#666666] text-[12px] uppercase mb-1">Date</Text>
                                    <Text className="font-bold text-[14px] m-0 text-white">{date}</Text>
                                </Column>
                            </Row>
                            <Hr className="border border-solid border-[#eaeaea] my-[16px]" />
                            <Row>
                                <Column>
                                    <Text className="text-white text-[14px] font-semibold">{flyerName}</Text>
                                </Column>
                                <Column align="right">
                                    <Text className="text-white text-[14px] font-bold">₹{total}</Text>
                                </Column>
                            </Row>
                            <Hr className="border border-solid border-[#eaeaea] my-[16px]" />
                            <Row>
                                <Column>
                                    <Text className="text-[#666666] text-[12px] uppercase mb-1">Status</Text>
                                    <Text className="font-bold text-[14px] m-0 text-green-400">✓ Received</Text>
                                </Column>
                            </Row>
                        </Section>

                        <Section className="text-center mt-[32px] mb-[32px]">
<Text className="text-[#666666] text-[12px] text-center">
    Please login to your account to view your order details.
</Text>

                            <Link

                            
                         href={downloadUrl || `https://grodify.com/orders?redirect=true`}
                                className="bg-[#000000] rounded-full text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
                            >
                                View Your Order
                            </Link>
                        </Section>

                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            If you have any questions, feel free to reply to this email or contact us at{" "}
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

export default PurchaseReceivingEmail;