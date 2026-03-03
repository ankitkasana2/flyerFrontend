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

interface OrderConfirmationEmailProps {
    name: string;
    orderId: string;
    flyerName: string;
    total: string;
    date: string;
    imageUrl?: string;
}

export const OrderConfirmationEmail = ({
    name,
    orderId,
    flyerName,
    total,
    date,
    imageUrl,
}: OrderConfirmationEmailProps) => {
    const previewText = `Your Grodify order #${orderId} has been confirmed!`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Section className="mt-[32px]">
                            <Img
                                src="https://grodify.com/logo.png"
                                width="120"
                                height="40"
                                alt="Grodify"
                                className="mx-auto my-0"
                            />
                        </Section>
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Order Confirmed!
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello {name},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Thank you for chooses <strong>Grodify</strong> for your flyer needs. We've received your order and our designers are getting started.
                        </Text>

                        <Section className="bg-[#f9f9f9] rounded-lg p-[20px] my-[24px]">
                            <Row>
                                <Column>
                                    <Text className="text-[#666666] text-[12px] uppercase mb-1">Order ID</Text>
                                    <Text className="font-bold text-[14px] m-0">#{orderId}</Text>
                                </Column>
                                <Column>
                                    <Text className="text-[#666666] text-[12px] uppercase mb-1">Date</Text>
                                    <Text className="font-bold text-[14px] m-0">{date}</Text>
                                </Column>
                            </Row>
                            <Hr className="border border-solid border-[#eaeaea] my-[16px]" />
                            <Row>
                                <Column>
                                    <Text className="text-black text-[14px] font-semibold">{flyerName}</Text>
                                </Column>
                                <Column align="right">
                                    <Text className="text-black text-[14px] font-bold">₹{total}</Text>
                                </Column>
                            </Row>
                            {imageUrl && (
                                <Section className="mt-[16px]">
                                    <Img
                                        src={imageUrl}
                                        width="100%"
                                        className="rounded-lg object-cover"
                                        alt="Order Flyer"
                                    />
                                </Section>
                            )}
                        </Section>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Link
                                href={`https://grodify.com/profile/orders`}
                                className="bg-[#000000] rounded-full text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
                            >
                                View Order Status
                            </Link>
                        </Section>

                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            If you have any questions, feel free to reply to this email or contact us at <Link href="mailto:admin@grodify.com" className="text-blue-600 no-underline">admin@grodify.com</Link>.
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

export default OrderConfirmationEmail;
