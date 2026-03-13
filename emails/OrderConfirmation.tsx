import {
    Body,
    Head,
    Html,
    Img,
    Preview,
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

    const flyersToShow: FlyerItem[] = allFlyers && allFlyers.length > 0
        ? allFlyers
        : [{ orderId, flyerName, total, imageUrl }];

    const grandTotal = allFlyers && allFlyers.length > 0
        ? allFlyers.reduce((sum, f) => sum + parseFloat(f.total || "0"), 0).toFixed(2)
        : total;

    const colors = {
        pageBg: '#f4f4f4',
        containerBg: '#ffffff',
        cardBg: '#f9f9f9',
        border: '#e0e0e0',
        black: '#111111',
        darkGray: '#444444',
        gray: '#888888',
        lightGray: '#aaaaaa',
        blue: '#1a73e8',
    };

    const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>

            <Body style={{ margin: '0', padding: '0', backgroundColor: colors.pageBg, fontFamily: font }}>

                <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                    style={{ backgroundColor: colors.pageBg }}>
                    <tr>
                        <td align="center" style={{ padding: '40px 20px', backgroundColor: colors.pageBg }}>

                            {/* MAIN CONTAINER */}
                            <table width="500" cellPadding="0" cellSpacing="0" role="presentation"
                                style={{
                                    maxWidth: '500px',
                                    width: '100%',
                                    backgroundColor: colors.containerBg,
                                    borderRadius: '12px',
                                    border: `1px solid ${colors.border}`,
                                    overflow: 'hidden',
                                }}>

                                {/* ✅ BLACK LOGO HEADER - fixed */}
                                <tr>
                                    <td align="center"
                                        bgcolor="#000000"
                                        style={{
                                            backgroundColor: '#000000',
                                            padding: '28px 32px',
                                            textAlign: 'center',
                                            lineHeight: '0',
                                        }}>
                                        <Img
                                            src="https://grodify.com/logo-email-banner.png"
                                               width="300"
                                               height="80"
                                            alt="Grodify"
                                            style={{
                                                display: 'block',
                                                margin: '0 auto',
                                                width: '140px',
                                                height: '46px',
                                                border: '0',
                                                outline: 'none',
                                                backgroundColor: '#000000',
                                            }}
                                        />
                                    </td>
                                </tr>

                                {/* GREEN SUCCESS BANNER */}
                                <tr>
                                    <td bgcolor="#22c55e"
                                        style={{
                                            backgroundColor: '#22c55e',
                                            padding: '14px 16px',
                                            textAlign: 'center',
                                        }}>
                                        <p style={{
                                            color: '#ffffff',
                                            fontSize: '15px',
                                            fontWeight: '700',
                                            margin: '0',
                                            fontFamily: font,
                                            backgroundColor: '#22c55e',
                                        }}>
                                            ✓ &nbsp; Order Confirmed!
                                        </p>
                                    </td>
                                </tr>

                                {/* BODY */}
                                <tr>
                                    <td style={{ padding: '32px', backgroundColor: colors.containerBg }}>

                                        {/* Greeting */}
                                        <p style={{ color: colors.black, fontSize: '16px', lineHeight: '26px', margin: '0 0 8px 0', fontFamily: font, backgroundColor: colors.containerBg }}>
                                            Hello <strong style={{ color: colors.black }}>{name}</strong>,
                                        </p>
                                        <p style={{ color: colors.darkGray, fontSize: '14px', lineHeight: '24px', margin: '0 0 28px 0', fontFamily: font, backgroundColor: colors.containerBg }}>
                                            Thank you for choosing <strong style={{ color: colors.black }}>Grodify</strong> for your flyer needs. We've received your order and our designers are getting started.
                                        </p>

                                        {/* ORDER SUMMARY CARD */}
                                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                                            style={{ backgroundColor: colors.cardBg, borderRadius: '8px', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
                                            <tr>
                                                <td style={{ padding: '16px 20px', backgroundColor: colors.cardBg, borderRadius: '8px' }}>
                                                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                                                        <tr>
                                                            <td style={{ backgroundColor: colors.cardBg }}>
                                                                <p style={{ color: colors.gray, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', fontFamily: font, backgroundColor: colors.cardBg }}>Order Date</p>
                                                                <p style={{ color: colors.black, fontSize: '14px', fontWeight: '700', margin: '0', fontFamily: font, backgroundColor: colors.cardBg }}>{date}</p>
                                                            </td>
                                                            <td align="right" style={{ backgroundColor: colors.cardBg }}>
                                                                <p style={{ color: colors.gray, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', fontFamily: font, backgroundColor: colors.cardBg }}>Total Items</p>
                                                                <p style={{ color: colors.black, fontSize: '14px', fontWeight: '700', margin: '0', fontFamily: font, backgroundColor: colors.cardBg }}>
                                                                    {flyersToShow.length} Flyer{flyersToShow.length > 1 ? 's' : ''}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        {/* EACH FLYER CARD */}
                                        {flyersToShow.map((flyer) => (
                                            <table
                                                key={flyer.orderId}
                                                width="100%"
                                                cellPadding="0"
                                                cellSpacing="0"
                                                role="presentation"
                                                style={{
                                                    backgroundColor: colors.cardBg,
                                                    borderRadius: '8px',
                                                    border: `1px solid ${colors.border}`,
                                                    marginBottom: '12px',
                                                }}
                                            >
                                                <tr>
                                                    <td style={{ padding: '16px 20px', backgroundColor: colors.cardBg, borderRadius: '8px' }}>

                                                        {/* Order ID + Price */}
                                                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                                                            <tr>
                                                                <td style={{ backgroundColor: colors.cardBg }}>
                                                                    <p style={{ color: colors.gray, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', fontFamily: font, backgroundColor: colors.cardBg }}>Order ID</p>
                                                                    <p style={{ color: colors.black, fontSize: '14px', fontWeight: '700', margin: '0', fontFamily: font, backgroundColor: colors.cardBg }}>#{flyer.orderId}</p>
                                                                </td>
                                                                <td align="right" style={{ backgroundColor: colors.cardBg }}>
                                                                    <p style={{ color: colors.gray, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', fontFamily: font, backgroundColor: colors.cardBg }}>Price</p>
                                                                    <p style={{ color: colors.black, fontSize: '14px', fontWeight: '700', margin: '0', fontFamily: font, backgroundColor: colors.cardBg }}>${parseFloat(flyer.total).toFixed(2)}</p>
                                                                </td>
                                                            </tr>
                                                        </table>

                                                        {/* Divider */}
                                                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '12px 0' }}>
                                                            <tr>
                                                                <td style={{ borderTop: `1px solid ${colors.border}`, fontSize: '0', lineHeight: '0', backgroundColor: colors.cardBg }}>&nbsp;</td>
                                                            </tr>
                                                        </table>

                                                        {/* Flyer Name */}
                                                        <p style={{ color: colors.black, fontSize: '15px', fontWeight: '600', margin: '0 0 12px 0', fontFamily: font, backgroundColor: colors.cardBg }}>
                                                            {flyer.flyerName}
                                                        </p>

                                                        {/* Flyer Image */}
                                                        {flyer.imageUrl && (
                                                            <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                                                                <tr>
                                                                    <td style={{ backgroundColor: colors.cardBg }}>
                                                                        <Img
                                                                            src={flyer.imageUrl}
                                                                            width="100%"
                                                                            alt={flyer.flyerName}
                                                                            style={{
                                                                                width: '100%',
                                                                                maxWidth: '100%',
                                                                                borderRadius: '8px',
                                                                                display: 'block',
                                                                            }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        )}
                                                    </td>
                                                </tr>
                                            </table>
                                        ))}

                                        {/* GRAND TOTAL */}
                                        {flyersToShow.length > 1 && (
                                            <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                                                style={{ backgroundColor: '#111111', borderRadius: '8px', marginBottom: '16px' }}>
                                                <tr>
                                                    <td bgcolor="#111111" style={{ padding: '16px 20px', backgroundColor: '#111111', borderRadius: '8px' }}>
                                                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                                                            <tr>
                                                                <td style={{ backgroundColor: '#111111' }}>
                                                                    <p style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold', margin: '0', fontFamily: font, backgroundColor: '#111111' }}>Grand Total</p>
                                                                </td>
                                                                <td align="right" style={{ backgroundColor: '#111111' }}>
                                                                    <p style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold', margin: '0', fontFamily: font, backgroundColor: '#111111' }}>${grandTotal}</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        )}

                                        {/* BUTTON */}
                                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                                            style={{ marginTop: '28px', marginBottom: '28px' }}>
                                            <tr>
                                                <td align="center" style={{ backgroundColor: colors.containerBg }}>
                                                    <a href="https://grodify.com/orders"
                                                        style={{
                                                            backgroundColor: '#111111',
                                                            borderRadius: '8px',
                                                            color: '#ffffff',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            textDecoration: 'none',
                                                            padding: '14px 40px',
                                                            display: 'inline-block',
                                                            fontFamily: font,
                                                        }}>
                                                        View Order Status →
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        {/* DIVIDER */}
                                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                                            <tr>
                                                <td style={{ borderTop: `1px solid ${colors.border}`, fontSize: '0', lineHeight: '0', backgroundColor: colors.containerBg }}>&nbsp;</td>
                                            </tr>
                                        </table>

                                        {/* FOOTER */}
                                        <p style={{ color: colors.gray, fontSize: '12px', lineHeight: '22px', margin: '20px 0 0 0', fontFamily: font, backgroundColor: colors.containerBg }}>
                                            If you have any questions, feel free to reply to this email or contact us at{' '}
                                            <a href="mailto:admin@grodify.com" style={{ color: colors.blue, textDecoration: 'none' }}>
                                                admin@grodify.com
                                            </a>.
                                        </p>

                                        <p style={{ color: colors.lightGray, fontSize: '11px', textAlign: 'center', margin: '20px 0 0 0', fontFamily: font, backgroundColor: colors.containerBg }}>
                                            © 2024 Grodify. All rights reserved.
                                        </p>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>

            </Body>
        </Html>
    );
};

export default OrderConfirmationEmail;