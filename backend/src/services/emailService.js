const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Generates an HTML invoice and attempts to send it via SMTP or falls back to writing a local HTML file.
 * @param {Object} order - The Prisma Order object including items and products.
 */
exports.sendInvoiceEmail = async (order) => {
  try {
    const invoiceId = order.id;
    const formattedDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    };

    // Calculate subtotal
    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountAmount = order.promoCode && order.promoCode.toUpperCase() === 'ETHEREAL10' 
      ? subtotal * 0.1 
      : 0;

    // Render items table rows
    const itemRows = order.items.map(item => {
      // Color can be parsed or defaulted
      const colorText = item.color || 'Default';
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; font-weight: 500; color: #4a3e3d;">${item.product.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; color: #7a6e6c; text-align: center;">${colorText}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; color: #7a6e6c; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; color: #4a3e3d; text-align: right;">${formatCurrency(item.price)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; color: #4a3e3d; text-align: right; font-weight: bold;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>
      `;
    }).join('');

    // Instruction based on payment method
    let paymentInstructions = '';
    if (order.paymentMethod === 'Bank Transfer') {
      paymentInstructions = `
        <div style="background-color: #faf7f5; border: 1px solid #e2dcd5; padding: 16px; border-radius: 12px; margin-top: 15px;">
          <h4 style="margin: 0 0 8px 0; color: #6d544c; font-size: 13px; font-weight: bold; text-transform: uppercase;">Instruksi Transfer Bank</h4>
          <p style="margin: 0 0 8px 0; color: #7a6e6c; font-size: 12px;">Silakan transfer pembayaran ke rekening bank berikut:</p>
          <div style="font-family: monospace; font-size: 13px; color: #4a3e3d; padding: 10px; background-color: #ffffff; border: 1px solid #eae5df; border-radius: 8px;">
            <strong>Bank BCA:</strong> 8012-3456-78<br/>
            <strong>A/N:</strong> Ethereal Hijab Indonesia<br/>
            <strong>Jumlah:</strong> ${formatCurrency(order.totalAmount)}
          </div>
          <p style="margin: 8px 0 0 0; color: #d97706; font-size: 10px; font-weight: bold;">* Mohon sertakan nomor invoice #${invoiceId} pada catatan transfer.</p>
        </div>
      `;
    } else if (order.paymentMethod === 'QRIS') {
      paymentInstructions = `
        <div style="background-color: #faf7f5; border: 1px solid #e2dcd5; padding: 16px; border-radius: 12px; margin-top: 15px; text-align: center;">
          <h4 style="margin: 0 0 8px 0; color: #6d544c; font-size: 13px; font-weight: bold; text-transform: uppercase;">Instruksi Pembayaran QRIS</h4>
          <p style="margin: 0 0 10px 0; color: #7a6e6c; font-size: 12px;">Scan kode QRIS di bawah ini dengan aplikasi e-wallet Anda:</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EtherealHijabQRIS" alt="QRIS Code" style="width: 140px; height: 140px; border: 1px solid #e2dcd5; border-radius: 8px; padding: 4px; background-color: #ffffff;" />
          <p style="margin: 8px 0 0 0; color: #4a3e3d; font-size: 12px; font-weight: bold;">Total: ${formatCurrency(order.totalAmount)}</p>
        </div>
      `;
    } else {
      paymentInstructions = `
        <div style="background-color: #faf7f5; border: 1px solid #e2dcd5; padding: 16px; border-radius: 12px; margin-top: 15px;">
          <h4 style="margin: 0 0 8px 0; color: #6d544c; font-size: 13px; font-weight: bold; text-transform: uppercase;">Konfirmasi WhatsApp</h4>
          <p style="margin: 0; color: #7a6e6c; font-size: 12px; line-height: 1.5;">Admin kami akan menghubungi Anda di WhatsApp untuk memverifikasi pesanan Anda. Anda juga dapat melakukan konfirmasi manual dengan mengklik tautan WhatsApp di panel pesanan Anda.</p>
        </div>
      `;
    }

    // HTML Email Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice EtherealHijab #${invoiceId}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f3f0; color: #4a3e3d; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f3f0; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 12px rgba(109, 84, 76, 0.08); border: 1px solid #eae5df;">
                
                <!-- Brand Header -->
                <tr>
                  <td align="center" style="background-color: #6d544c; padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-family: serif; font-size: 26px; tracking-widest; letter-spacing: 2px;">ETHEREAL<span style="font-weight: 300; opacity: 0.9;">HIJAB</span></h1>
                    <p style="margin: 5px 0 0 0; color: #f2e9e4; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;">Premium Voal & Pashmina Daily</p>
                  </td>
                </tr>

                <!-- Intro / Invoice Meta -->
                <tr>
                  <td style="padding: 30px 30px 20px 30px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <h2 style="margin: 0 0 10px 0; color: #6d544c; font-size: 18px; font-weight: bold;">Terima Kasih Atas Pesanan Anda!</h2>
                          <p style="margin: 0; color: #7a6e6c; font-size: 13px; line-height: 1.5;">Hai <strong>${order.customerName}</strong>, pesanan Anda telah berhasil diterima dan sedang menunggu verifikasi pembayaran. Berikut rincian invoice Anda:</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Invoice Details Box -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                      <tr>
                        <td width="50%" style="background-color: #faf7f5; border: 1px solid #eae5df; border-radius: 12px 0 0 12px; padding: 15px; vertical-align: top;">
                          <span style="display: block; font-size: 10px; color: #a39591; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Detail Tagihan</span>
                          <strong style="display: block; font-size: 13px; color: #4a3e3d; margin-bottom: 2px;">#${invoiceId}</strong>
                          <span style="font-size: 12px; color: #7a6e6c;">Tanggal: ${formattedDate}</span>
                        </td>
                        <td width="50%" style="background-color: #faf7f5; border: 1px solid #eae5df; border-left: none; border-radius: 0 12px 12px 0; padding: 15px; vertical-align: top;">
                          <span style="display: block; font-size: 10px; color: #a39591; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Alamat Pengiriman</span>
                          <strong style="display: block; font-size: 12px; color: #4a3e3d; margin-bottom: 2px;">${order.customerName}</strong>
                          <span style="font-size: 11px; color: #7a6e6c; line-height: 1.4; display: block;">${order.address}</span>
                          <span style="font-size: 11px; color: #7a6e6c; display: block; margin-top: 4px;">WhatsApp: ${order.whatsapp}</span>
                          <span style="font-size: 11px; color: #7a6e6c; display: block;">Email: ${order.email}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Items Table -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; text-align: left; font-size: 12px;">
                      <thead>
                        <tr style="background-color: #6d544c; color: #ffffff;">
                          <th style="padding: 10px 12px; border-radius: 8px 0 0 8px; font-weight: 600;">Produk</th>
                          <th style="padding: 10px 12px; text-align: center; font-weight: 600;">Varian</th>
                          <th style="padding: 10px 12px; text-align: center; font-weight: 600;">Qty</th>
                          <th style="padding: 10px 12px; text-align: right; font-weight: 600;">Harga</th>
                          <th style="padding: 10px 12px; text-align: right; border-radius: 0 8px 8px 0; font-weight: 600;">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemRows}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Totals -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px;">
                      <tr>
                        <td width="60%"></td>
                        <td width="40%">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                            <tr>
                              <td style="padding: 6px 0; color: #7a6e6c;">Subtotal</td>
                              <td style="padding: 6px 0; text-align: right; color: #4a3e3d; font-weight: 500;">${formatCurrency(subtotal)}</td>
                            </tr>
                            ${discountAmount > 0 ? `
                            <tr>
                              <td style="padding: 6px 0; color: #16a34a; font-weight: 500;">Diskon (${order.promoCode})</td>
                              <td style="padding: 6px 0; text-align: right; color: #16a34a; font-weight: 600;">-${formatCurrency(discountAmount)}</td>
                            </tr>
                            ` : ''}
                            <tr>
                              <td style="padding: 6px 0; color: #7a6e6c;">Ongkos Kirim</td>
                              <td style="padding: 6px 0; text-align: right; color: #16a34a; font-weight: 600; text-transform: uppercase;">Gratis</td>
                            </tr>
                            <tr style="border-top: 1px dashed #eae5df;">
                              <td style="padding: 10px 0 0 0; font-size: 14px; font-weight: bold; color: #6d544c;">Total Bayar</td>
                              <td style="padding: 10px 0 0 0; font-size: 15px; font-weight: bold; text-align: right; color: #6d544c;">${formatCurrency(order.totalAmount)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Notes -->
                ${order.notes ? `
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <div style="background-color: #fbfbfc; border: 1px solid #eae5df; padding: 12px; border-radius: 8px;">
                      <span style="display: block; font-size: 9px; color: #a39591; text-transform: uppercase; font-weight: bold; margin-bottom: 2px;">Catatan Pelanggan</span>
                      <span style="font-size: 11px; color: #7a6e6c; font-style: italic;">"${order.notes}"</span>
                    </div>
                  </td>
                </tr>
                ` : ''}

                <!-- Payment Method & Tracking -->
                <tr>
                  <td style="padding: 0 30px 30px 30px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="display: block; font-size: 10px; color: #a39591; text-transform: uppercase; font-weight: bold;">Metode Pembayaran: <strong style="color: #6d544c;">${order.paymentMethod}</strong></span>
                          ${paymentInstructions}
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-top: 25px;">
                          <a href="http://localhost:3000/tracking?orderId=${invoiceId}" style="display: inline-block; background-color: #6d544c; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: bold; box-shadow: 0 2px 4px rgba(109, 84, 76, 0.15);">Lacak Status Pesanan</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footnote Banner -->
                <tr>
                  <td align="center" style="background-color: #faf7f5; padding: 20px; text-align: center; border-top: 1px solid #eae5df;">
                    <p style="margin: 0; font-size: 11px; color: #a39591; line-height: 1.5;">Invoice ini dikirim secara otomatis oleh EtherealHijab.<br/>Ada pertanyaan? Hubungi CS WhatsApp kami di +62 812-3456-7890.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 1. Write invoice HTML to backend/uploads/invoices
    const uploadDir = path.join(__dirname, '../../uploads/invoices');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const invoiceFilename = `invoice-${invoiceId}.html`;
    const invoiceFilePath = path.join(uploadDir, invoiceFilename);
    fs.writeFileSync(invoiceFilePath, htmlContent, 'utf8');
    
    console.log(`==================================================`);
    console.log(`INVOICE FILE GENERATED: ${invoiceFilePath}`);
    console.log(`Access statically via: http://localhost:5000/uploads/invoices/${invoiceFilename}`);
    console.log(`==================================================`);

    // 2. Dispatch email over SMTP if config is defined in env
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      console.log(`SMTP configured. Sending invoice to ${order.email}...`);
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT) || 587,
        secure: parseInt(SMTP_PORT) === 465, // true for 465, false for others
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      });

      const mailOptions = {
        from: SMTP_FROM || '"EtherealHijab" <noreply@etherealhijab.com>',
        to: order.email,
        subject: `[EtherealHijab] Invoice Pesanan #${invoiceId}`,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } else {
      console.log(`==================================================`);
      console.log(`EMAIL NOT SENT: SMTP is not configured in .env.`);
      console.log(`Running in mock mode. Invoice saved as static file.`);
      console.log(`==================================================`);
    }

    return `/uploads/invoices/${invoiceFilename}`;
  } catch (err) {
    console.error('Error generating/sending invoice:', err);
    return null;
  }
};
