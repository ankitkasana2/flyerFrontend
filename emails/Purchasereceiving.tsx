import {
    Body,
    Head,
    Html,
    Img,
    Preview,
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

    const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

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
                    style={{ backgroundColor: pageBg }}>
                    <tr>
                        <td align="center" bgcolor="#f4f4f4" style={{ padding: '40px 0', backgroundColor: pageBg }}>

                            {/* MAIN CONTAINER */}
                            <table width="500" cellPadding="0" cellSpacing="0" role="presentation"
                                style={{
                                    maxWidth: '500px',
                                    width: '100%',
                                    backgroundColor: containerBg,
                                }}>

                                {/* BLACK LOGO HEADER */}
                                <tr>
                                    <td align="center" bgcolor="#000000"
                                        style={{
                                            backgroundColor: '#000000',
                                            padding: '20px 0',
                                            textAlign: 'center',
                                            lineHeight: '0',
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
                                                backgroundColor: '#000000',
                                            }}
                                        />
                                    </td>
                                </tr>

                                {/* ORANGE PURCHASE BANNER */}
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
                                             &nbsp; Purchase Received!
                                        </p>
                                    </td>
                                </tr>

                                {/* BODY */}
                                <tr>
                                    <td bgcolor="#ffffff" style={{ padding: '32px', backgroundColor: containerBg }}>

                                        {/* Greeting */}
                                        <p style={{ color: black, fontSize: '16px', lineHeight: '26px', margin: '0 0 8px 0', fontFamily: font }}>
                                            Hello <strong>{name}</strong>,
                                        </p>
                                        <p style={{ color: darkGray, fontSize: '14px', lineHeight: '24px', margin: '0 0 28px 0', fontFamily: font }}>
                                            We have successfully received your purchase. Our team will start working on your order shortly and you will be notified once it is ready.
                                        </p>

                                        {/* ORDER DETAIL CARD */}
                                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                                            style={{ backgroundColor: cardBg, border: `1px solid ${border}`, marginBottom: '16px' }}>
                                            <tr>
                                                <td bgcolor="#f9f9f9" style={{ padding: '16px 20px', backgroundColor: cardBg }}>

                                                    {/* Order ID + Date Row */}
                                                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                                                        <tr>
                                                            <td bgcolor="#f9f9f9" style={{ backgroundColor: cardBg }}>
                                                                <p style={{ color: gray, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', fontFamily: font }}>Order ID</p>
                                                                <p style={{ color: black, fontSize: '14px', fontWeight: '700', margin: '0', fontFamily: font }}>#{orderId}</p>
                                                            </td>
                                                            <td align="right" bgcolor="#f9f9f9" style={{ backgroundColor: cardBg }}>
                                                                <p style={{ color: gray, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', fontFamily: font }}>Date</p>
                                                                <p style={{ color: black, fontSize: '14px', fontWeight: '700', margin: '0', fontFamily: font }}>{date}</p>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                    {/* Divider */}
                                                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '12px 0' }}>
                                                        <tr>
                                                            <td style={{ borderTop: `1px solid ${border}`, fontSize: '0', lineHeight: '0' }}>&nbsp;</td>
                                                        </tr>
                                                    </table>

                                                    {/* Flyer Name + Price */}
                                                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                                                        <tr>
                                                            <td bgcolor="#f9f9f9" style={{ backgroundColor: cardBg }}>
                                                                <p style={{ color: black, fontSize: '14px', fontWeight: '600', margin: '0', fontFamily: font }}>{flyerName}</p>
                                                            </td>
                                                            <td align="right" bgcolor="#f9f9f9" style={{ backgroundColor: cardBg }}>
                                                                <p style={{ color: black, fontSize: '14px', fontWeight: '700', margin: '0', fontFamily: font }}>₹{total}</p>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                    {/* Divider */}
                                                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '12px 0' }}>
                                                        <tr>
                                                            <td style={{ borderTop: `1px solid ${border}`, fontSize: '0', lineHeight: '0' }}>&nbsp;</td>
                                                        </tr>
                                                    </table>

                                                    {/* Status */}
                                                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                                                        <tr>
                                                            <td bgcolor="#f9f9f9" style={{ backgroundColor: cardBg }}>
                                                                <p style={{ color: gray, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', fontFamily: font }}>Status</p>
                                                                <p style={{ color: '#16a34a', fontSize: '14px', fontWeight: '700', margin: '0', fontFamily: font }}>✓ Received</p>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                            </tr>
                                        </table>

                                        {/* INFO TEXT */}
                                        <p style={{ color: gray, fontSize: '12px', textAlign: 'center', margin: '0 0 16px 0', fontFamily: font }}>
                                            Please login to your account to view your order details.
                                        </p>

                                        {/* BUTTON */}
                                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                                            style={{ marginBottom: '28px' }}>
                                            <tr>
                                                <td align="center" bgcolor="#ffffff" style={{ backgroundColor: containerBg }}>
                                                    <a href={downloadUrl || 'https://grodify.com/orders?redirect=true'}
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
                                                        View Your Order →
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

                        </td>
                    </tr>
                </table>

            </Body>
        </Html>
    );
};

export default PurchaseReceivingEmail;