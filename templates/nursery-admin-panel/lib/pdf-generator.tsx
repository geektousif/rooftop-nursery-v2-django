import html2pdf from 'html2pdf.js'
import { Order } from './types'

export interface InvoiceOptions {
  companyName?: string
  companyLogo?: string
  companyAddress?: string
}

export function generateInvoicePDF(
  order: Order,
  options: InvoiceOptions = {}
) {
  const {
    companyName = 'Rooftop Nursery',
    companyAddress = '123 Green Street, Nature City, NC 12345',
  } = options

  // Create HTML content for invoice
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2D2A26; }
        .container { max-width: 8.5in; height: 11in; padding: 0.5in; }
        .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem; border-bottom: 2px solid #2F5233; padding-bottom: 1rem; }
        .company-info h1 { font-size: 24px; color: #2F5233; margin-bottom: 0.25rem; }
        .company-info p { font-size: 11px; color: #666; line-height: 1.4; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { font-size: 28px; color: #2F5233; }
        .invoice-title p { font-size: 12px; color: #666; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
        .detail-section h3 { font-size: 12px; color: #2F5233; font-weight: 600; margin-bottom: 0.5rem; }
        .detail-section p { font-size: 11px; color: #666; line-height: 1.6; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
        .items-table th { background-color: #2F5233; color: white; padding: 0.75rem; text-align: left; font-size: 11px; font-weight: 600; }
        .items-table td { padding: 0.75rem; border-bottom: 1px solid #f0f0f0; font-size: 11px; }
        .items-table tr:last-child td { border-bottom: 2px solid #2F5233; }
        .summary { width: 100%; }
        .summary-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 11px; }
        .summary-row.total { font-weight: 600; font-size: 13px; color: #2F5233; border-top: 2px solid #2F5233; padding-top: 0.75rem; margin-top: 0.75rem; }
        .summary-row.label { color: #666; }
        .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #f0f0f0; font-size: 10px; color: #999; text-align: center; }
        .amount { text-align: right; }
        @media print { body { margin: 0; padding: 0; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-info">
            <h1>${companyName}</h1>
            <p>${companyAddress}</p>
          </div>
          <div class="invoice-title">
            <h2>INVOICE</h2>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Invoice #${order.orderNumber}</p>
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-section">
            <h3>BILL TO</h3>
            <p>
              ${order.customerName}<br/>
              ${order.customerEmail}<br/>
              ${order.items[0]?.productName || 'N/A'}
            </p>
          </div>
          <div class="detail-section">
            <h3>SHIPPING TO</h3>
            <p>
              ${order.shippingAddress?.street || ''}<br/>
              ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.pincode}<br/>
              ${order.shippingAddress?.country}
            </p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40%">Product</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Price</th>
              <th style="width: 30%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.productName}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td class="amount">₹${item.price.toFixed(2)}</td>
                <td class="amount">₹${item.subtotal.toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end;">
          <div class="summary" style="width: 300px;">
            <div class="summary-row">
              <span class="label">Subtotal</span>
              <span class="amount">₹${order.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="label">Tax (15%)</span>
              <span class="amount">₹${order.tax.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="label">Shipping</span>
              <span class="amount">₹${order.shippingCost.toFixed(2)}</span>
            </div>
            ${
              order.discount > 0
                ? `
            <div class="summary-row">
              <span class="label">Discount</span>
              <span class="amount">-₹${order.discount.toFixed(2)}</span>
            </div>
            `
                : ''
            }
            <div class="summary-row total">
              <span>Total</span>
              <span class="amount">₹${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your order!</p>
          <p>For support, contact us at support@rooftopnursery.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  // Generate PDF
  const element = document.createElement('div')
  element.innerHTML = htmlContent

  const opt = {
    margin: 0,
    filename: `invoice-${order.orderNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }

  // This will trigger download
  html2pdf().set(opt).from(element).save()
}

// Alternative: Generate PDF as blob for API submission
export async function generateInvoicePDFBlob(
  order: Order,
  options: InvoiceOptions = {}
): Promise<Blob> {
  const {
    companyName = 'Rooftop Nursery',
    companyAddress = '123 Green Street, Nature City, NC 12345',
  } = options

  const htmlContent = `...` // Same as above

  const element = document.createElement('div')
  element.innerHTML = htmlContent

  const opt = {
    margin: 0,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }

  return new Promise((resolve, reject) => {
    html2pdf()
      .set(opt)
      .from(element)
      .output('blob')
      .then((blob: Blob) => resolve(blob))
      .catch(reject)
  })
}
