interface OrderConfirmationParams {
    name: string;
    orderId: string;
    flyerType: string;
}

export const orderConfirmationTemplate = ({
    name,
    orderId,
    flyerType,
}: OrderConfirmationParams) => `
  <div style="font-family: Arial, sans-serif">
    <h2>Order Confirmed 🎉</h2>
    <p>Hi <strong>${name}</strong>,</p>

    <p>Your order has been successfully created.</p>

    <table>
      <tr><td><strong>Order ID:</strong></td><td>${orderId}</td></tr>
      <tr><td><strong>Flyer Type:</strong></td><td>${flyerType}</td></tr>
    </table>

    <p>We’ll notify you once your flyer is ready.</p>

    <p>Thanks,<br/><strong>Grodify Team</strong></p>
  </div>
`;
