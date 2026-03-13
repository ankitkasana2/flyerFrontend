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

    const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    // Colors
    const pageBg = '#f4f4f4';
    const containerBg = '#ffffff';
    const cardBg = '#f9f9f9';
    const border = '#e0e0e0';
    const black = '#111111';
    const darkGray = '#444444';
    const gray = '#888888';
    const lightGray = '#aaaaaa';
    const blue = '#1a73e8';

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>

            <Body style={{ margin: '0', padding: '0', backgroundColor: pageBg, fontFamily: font }}>

                {/* PAGE WRAPPER */}
                <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                    style={{ backgroundColor: pageBg, margin: '0', padding: '0' }}>
                    <tr>
                        <td align="center" bgcolor="#f4f4f4" style={{ padding: '40px 0', backgroundColor: pageBg }}>

                            {/* MAIN CONTAINER - NO borderRadius, NO border = no white corners */}
                            <table width="500" cellPadding="0" cellSpacing="0" role="presentation"
                                style={{
                                    maxWidth: '500px',
                                    width: '100%',
                                    backgroundColor: containerBg,
                                    // NO borderRadius here - that causes white corners
                                    // NO border here
                                }}>

                                {/* ===== BLACK LOGO HEADER ===== */}
                                <tr>
                                    <td align="center" bgcolor="#000000"
                                        style={{
                                            backgroundColor: '#000000',
                                            padding: '20px 0',
                                            textAlign: 'center',
                                            lineHeight: '0',
                                            margin: '0',
                                        }}>
                                        <img
                                            src="https://grodify.com/logo-email-banner.png"
                                            width="300"
                                            height="80"
                                            alt="Grodify"
                                            style={{
                                                display: 'block',
                                                margin: '0 auto',
                                                width: '300px',
                                                height: '80px',
                                                border: '0',
                                                outline: 'none',
                                                textDecoration: 'none',
                                                backgroundColor: '#000000',
                                            }}
                                        />
                                    </td>
                                </tr>

                                {/* ===== GREEN BANNER ===== */}
                                <tr>
                                    <td align="center" bgcolor="#22c55e"
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

                                {/* ===== BODY ===== */}
                                <tr>
                                    <td bgcolor="#ffffff" style={{ padding: '32px', backgroundColor: containerBg }}>

                                        {/* Greeting */}
                                        <p style={{ color: black, fontSize: '16px', lineHeight: '26px', margin: '0 0 8px 0', fontFamily: font }}>
                                            Hello <strong>{name}</strong>,
                                        </p>
                                        <p style={{ color: darkGray, fontSize: '14px', lineHeight: '24px', margin: '0 0 28px 0', fontFamily: font }}>
                                            Thank you for choosing <strong style={{ color: black }}>Grodify</strong> for your flyer needs. We've received your order and our designers are getting started.
                                        </p>

                                        {/* ORDER SUMMARY CARD */}
                                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                                            style={{ backgroundColor: cardBg, border: `1px solid ${border}`, marginBottom: '16px' }}>
                                            <tr>
                                                <td bgcolor="#f9f9f9" style={{ padding: '16px 20px', backgroundColor: cardBg }}>
                                                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                                                        <tr>
                                                            <td bgcolor="#f9f9f9" style={{ backgroundColor: cardBg }}>
                                                                <p style={{ color: gray, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', fontFamily: font }}>Order Date</p>
                                                                <p style={{ color: black, fontSize: '14px', fontWeight: '700', margin: '0', fontFamily: font }}>{date}</p>
                                                            </td>
                                                            <td align="right" bgcolor="#f9f9f9" style={{ backgroundColor: cardBg }}>
                                                                <p style={{ color: gray, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', fontFamily: font }}>Total Items</p>
                                                                <p style={{ color: black, fontSize: '14px', fontWeight: '700', margin: '0', fontFamily: font }}>
                                                                    {flyersToShow.length} Flyer{flyersToShow.length > 1 ? 's' : ''}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        {/* EACH FLYER */}
                                        {flyersToShow.map((flyer) => (
                                            <table
                                                key={flyer.orderId}
                                                width="100%"
                                                cellPadding="0"
                                                cellSpacing="0"
                                                role="presentation"
                                                style={{
                                                    backgroundColor: cardBg,
                                                    border: `1px solid ${border}`,
                                                    marginBottom: '12px',
                                                }}
                                            >
                                                <tr>
                                                    <td bgcolor="#f9f9f9" style={{ padding: '16px 20px', backgroundColor: cardBg }}>
                                                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                                                            <tr>
                                                                <td bgcolor="#f9f9f9" style={{ backgroundColor: cardBg }}>
                                                                    <p style={{ color: gray, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', fontFamily: font }}>Order ID</p>
                                                                    <p style={{ color: black, fontSize: '14px', fontWeight: '700', margin: '0', fontFamily: font }}>#{flyer.orderId}</p>
                                                                </td>
                                                                <td align="right" bgcolor="#f9f9f9" style={{ backgroundColor: cardBg }}>
                                                                    <p style={{ color: gray, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', fontFamily: font }}>Price</p>
                                                                    <p style={{ color: black, fontSize: '14px', fontWeight: '700', margin: '0', fontFamily: font }}>${parseFloat(flyer.total).toFixed(2)}</p>
                                                                </td>
                                                            </tr>
                                                        </table>

                                                        {/* Divider */}
                                                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '12px 0' }}>
                                                            <tr>
                                                                <td style={{ borderTop: `1px solid ${border}`, fontSize: '0', lineHeight: '0' }}>&nbsp;</td>
                                                            </tr>
                                                        </table>

                                                        <p style={{ color: black, fontSize: '15px', fontWeight: '600', margin: '0 0 12px 0', fontFamily: font }}>
                                                            {flyer.flyerName}
                                                        </p>

                                                        {flyer.imageUrl && (
                                                            <img
                                                                src={flyer.imageUrl}
                                                                width="100%"
                                                                alt={flyer.flyerName}
                                                                style={{
                                                                    width: '100%',
                                                                    maxWidth: '100%',
                                                                    display: 'block',
                                                                    border: '0',
                                                                }}
                                                            />
                                                        )}
                                                    </td>
                                                </tr>
                                            </table>
                                        ))}

                                        {/* GRAND TOTAL */}
                                        {flyersToShow.length > 1 && (
                                            <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                                                style={{ marginBottom: '16px' }}>
                                                <tr>
                                                    <td bgcolor="#111111" style={{ padding: '16px 20px', backgroundColor: '#111111' }}>
                                                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                                                            <tr>
                                                                <td bgcolor="#111111" style={{ backgroundColor: '#111111' }}>
                                                                    <p style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold', margin: '0', fontFamily: font }}>Grand Total</p>
                                                                </td>
                                                                <td align="right" bgcolor="#111111" style={{ backgroundColor: '#111111' }}>
                                                                    <p style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold', margin: '0', fontFamily: font }}>${grandTotal}</p>
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
                                                <td align="center" bgcolor="#ffffff" style={{ backgroundColor: containerBg }}>
                                                    <a href="https://grodify.com/orders"
                                                        style={{
                                                            backgroundColor: '#111111',
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
                                                <td style={{ borderTop: `1px solid ${border}`, fontSize: '0', lineHeight: '0' }}>&nbsp;</td>
                                            </tr>
                                        </table>

                                        {/* FOOTER */}
                                        <p style={{ color: gray, fontSize: '12px', lineHeight: '22px', margin: '20px 0 0 0', fontFamily: font }}>
                                            If you have any questions, feel free to reply to this email or contact us at{' '}
                                            <a href="mailto:admin@grodify.com" style={{ color: blue, textDecoration: 'none' }}>
                                                admin@grodify.com
                                            </a>.
                                        </p>

                                        <p style={{ color: lightGray, fontSize: '11px', textAlign: 'center', margin: '20px 0 0 0', fontFamily: font }}>
                                            © 2024 Grodify. All rights reserved.
                                        </p>

                                    </td>
                                </tr>
                            </table>
                            {/* end main container */}

                        </td>
                    </tr>
                </table>

            </Body>
        </Html>
    );
};

export default OrderConfirmationEmail;