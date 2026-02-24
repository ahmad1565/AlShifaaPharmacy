import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderEmailData {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderItems: Array<{
    medicineName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  paymentGatewayInfo?: {
    name: string;
    accountName?: string;
    accountNumber?: string;
    paymentUrl?: string;
    instructions?: string;
  };
  customerAddress: string;
  customerPhone: string;
  notes?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { customerEmail, customerName, orderId, orderItems, totalAmount, paymentMethod, paymentGatewayInfo, customerAddress, customerPhone, notes }: OrderEmailData = await req.json();

    // Create email HTML
    const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #10b981; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .order-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .order-info h2 { color: #10b981; margin-top: 0; }
    .order-details { margin: 15px 0; }
    .order-details p { margin: 8px 0; color: #374151; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th { background: #f3f4f6; padding: 12px; text-align: right; font-weight: bold; color: #1f2937; }
    .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; }
    .total { background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .total .amount { font-size: 32px; color: #10b981; font-weight: bold; }
    .payment-info { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .payment-info h3 { color: #92400e; margin-top: 0; }
    .payment-info p { margin: 8px 0; color: #78350f; font-size: 15px; }
    .payment-info strong { color: #92400e; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    .contact { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 صيدلية الشفاء الحديثة</h1>
      <p>شكراً لاختياركم صيدليتنا</p>
    </div>
    
    <div class="content">
      <h2 style="color: #1f2937;">عزيزي ${customerName}،</h2>
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        تم استلام طلبك بنجاح! نحن نعمل على تجهيزه وسيتم التواصل معك قريباً لتأكيد التسليم.
      </p>
      
      <div class="order-info">
        <h2>تفاصيل الطلب</h2>
        <div class="order-details">
          <p><strong>رقم الطلب:</strong> ${orderId.substring(0, 8).toUpperCase()}</p>
          <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>رقم الهاتف:</strong> ${customerPhone}</p>
          <p><strong>عنوان التوصيل:</strong> ${customerAddress}</p>
          ${notes ? `<p><strong>ملاحظات:</strong> ${notes}</p>` : ''}
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>الدواء</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${orderItems.map(item => `
            <tr>
              <td>${item.medicineName}</td>
              <td>${item.quantity}</td>
              <td>${item.price} ج.م</td>
              <td><strong>${item.subtotal} ج.م</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total">
        <p style="margin: 0; color: #065f46; font-size: 18px; font-weight: bold;">المبلغ الإجمالي</p>
        <p class="amount">${totalAmount} ج.م</p>
      </div>

      ${paymentGatewayInfo ? `
      <div class="payment-info">
        <h3>⚠️ معلومات الدفع - ${paymentMethod}</h3>
        ${paymentGatewayInfo.accountName ? `<p><strong>اسم صاحب الحساب:</strong> ${paymentGatewayInfo.accountName}</p>` : ''}
        ${paymentGatewayInfo.accountNumber ? `<p><strong>رقم الحساب/المحفظة:</strong> <span style="font-size: 18px; background: white; padding: 5px 10px; border-radius: 4px; display: inline-block;">${paymentGatewayInfo.accountNumber}</span></p>` : ''}
        ${paymentGatewayInfo.paymentUrl ? `<p><strong>رابط الدفع:</strong> <a href="${paymentGatewayInfo.paymentUrl}" style="color: #10b981; word-break: break-all;">${paymentGatewayInfo.paymentUrl}</a></p>` : ''}
        ${paymentGatewayInfo.instructions ? `<p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f59e0b;"><strong>تعليمات:</strong><br>${paymentGatewayInfo.instructions}</p>` : ''}
        <p style="margin-top: 15px; font-weight: bold; color: #b45309;">
          بعد إتمام الدفع، يرجى الانتظار حتى يتم تأكيد الطلب من قبل الصيدلية.
        </p>
      </div>
      ` : `
      <div class="payment-info">
        <h3>💵 ${paymentMethod}</h3>
        <p>سيتم الدفع نقداً عند استلام الطلب.</p>
      </div>
      `}

      <p style="font-size: 15px; color: #6b7280; margin-top: 30px; text-align: center;">
        سنقوم بالتواصل معك عبر الهاتف لتأكيد الطلب وموعد التسليم.
      </p>
    </div>

    <div class="footer">
      <p><strong>صيدلية الشفاء الحديثة</strong></p>
      <div class="contact">
        <p>📧 البريد الإلكتروني: hajaraldhaheri2016@gmail.com</p>
        <p>📱 واتساب: +213558166889</p>
      </div>
      <p style="margin-top: 15px; font-size: 12px;">
        هذه رسالة تأكيد تلقائية، يرجى عدم الرد عليها
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email using Resend (will need API key)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.log('Email preview (RESEND_API_KEY not configured):');
      console.log('To:', customerEmail);
      console.log('Subject: تأكيد طلبك من صيدلية الشفاء - رقم الطلب', orderId.substring(0, 8).toUpperCase());
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email would be sent (preview mode)',
          preview: { to: customerEmail, orderId }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'صيدلية الشفاء <noreply@updates.onspace.app>',
        to: [customerEmail],
        subject: `تأكيد طلبك من صيدلية الشفاء - رقم الطلب ${orderId.substring(0, 8).toUpperCase()}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailData = await emailResponse.json();
    console.log('Email sent successfully:', emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-order-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
