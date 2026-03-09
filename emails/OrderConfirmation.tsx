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

interface FlyerItem {
    orderId: string;
    flyerName: string;
    total: string;
    imageUrl?: string;
}

interface OrderConfirmationEmailProps {
    name: string;
    orderId: string;
    flyerName: string;
    total: string;
    date: string;
    imageUrl?: string;
    // Multiple flyers support
    allFlyers?: FlyerItem[];
}

export const OrderConfirmationEmail = ({
    name,
    orderId,
    flyerName,
    total,
    date,
    imageUrl,
    allFlyers,
}: OrderConfirmationEmailProps) => {
    const previewText = `Your Grodify order #${orderId} has been confirmed!`;
    
    // Agar allFlyers array hai toh use karo, warna single flyer
    const flyersToShow: FlyerItem[] = allFlyers && allFlyers.length > 0
        ? allFlyers
        : [{ orderId, flyerName, total, imageUrl }];

    const grandTotal = allFlyers && allFlyers.length > 0
        ? allFlyers.reduce((sum, f) => sum + parseFloat(f.total || '0'), 0).toFixed(2)
        : total;

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
                            Order Confirmed!
                        </Heading>

                        <Text className="text-white text-[14px] leading-[24px]">
                            Hello {name},
                        </Text>
                        <Text className="text-white text-[14px] leading-[24px]">
                            Thank you for choosing <strong>Grodify</strong> for your flyer needs. We've received your order and our designers are getting started.
                        </Text>

                        {/* Order Summary Header */}
                        <Section className="bg-[#1a1a1a] rounded-lg p-[20px] my-[24px]">
                            <Row>
                                <Column>
                                    <Text className="text-[#666666] text-[12px] uppercase mb-1">Order Date</Text>
                                    <Text className="font-bold text-[14px] m-0 text-white">{date}</Text>
                                </Column>
                                <Column align="right">
                                    <Text className="text-[#666666] text-[12px] uppercase mb-1">Total Items</Text>
                                    <Text className="font-bold text-[14px] m-0 text-white">{flyersToShow.length} Flyer{flyersToShow.length > 1 ? 's' : ''}</Text>
                                </Column>
                            </Row>
                        </Section>

                        {/* Each Flyer */}
                        {flyersToShow.map((flyer, index) => (
                            <Section key={flyer.orderId} className="bg-[#1a1a1a] rounded-lg p-[20px] my-[12px]">
                                <Row>
                                    <Column>
                                        <Text className="text-[#666666] text-[12px] uppercase mb-1">Order ID</Text>
                                        <Text className="font-bold text-[14px] m-0 text-white">#{flyer.orderId}</Text>
                                    </Column>
                                    <Column align="right">
                                        <Text className="text-[#666666] text-[12px] uppercase mb-1">Price</Text>
                                        <Text className="font-bold text-[14px] m-0 text-white">${flyer.total}</Text>
                                    </Column>
                                </Row>
                                <Hr className="border border-solid border-[#333333] my-[12px]" />
                                <Row>
                                    <Column>
                                        <Text className="text-white text-[14px] font-semibold m-0">{flyer.flyerName}</Text>
                                    </Column>
                                </Row>
                                {flyer.imageUrl && (
                                    <Section className="mt-[12px]">
                                        <Img
                                            src={flyer.imageUrl}
                                            width="100%"
                                            className="rounded-lg object-cover"
                                            alt={flyer.flyerName}
                                        />
                                    </Section>
                                )}
                            </Section>
                        ))}

                        {/* Grand Total — sirf multiple flyers ke liye */}
                        {flyersToShow.length > 1 && (
                            <Section className="bg-[#222222] rounded-lg p-[16px] my-[12px]">
                                <Row>
                                    <Column>
                                        <Text className="text-white text-[16px] font-bold m-0">Grand Total</Text>
                                    </Column>
                                    <Column align="right">
                                        <Text className="text-white text-[16px] font-bold m-0">${grandTotal}</Text>
                                    </Column>
                                </Row>
                            </Section>
                        )}

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Link
                                href="https://grodify.com/orders"
                                className="bg-[#000000] rounded-full text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
                            >
                                View Order Status
                            </Link>
                        </Section>

                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            If you have any questions, feel free to reply to this email or contact us at{' '}
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

export default OrderConfirmationEmail;