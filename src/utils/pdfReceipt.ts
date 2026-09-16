import { jsPDF } from 'jspdf';
import { OrderRecord } from '../types';
import { getCutLabel } from '../data/products';
import { openWhatsAppSafe, getOfficialWhatsAppLink } from './whatsappHelper';

/**
 * Generates a clean, professional PDF receipt document for an order.
 */
export function generateReceiptPDF(order: OrderRecord): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  // Primary Colors
  const emeraldDark = [6, 78, 59]; // #064e3b
  const emeraldPrimary = [5, 150, 105]; // #059669
  const textDark = [28, 25, 23]; // #1c1917
  const textMuted = [120, 113, 108]; // #78716c
  const bgLight = [245, 245, 244]; // #f5f5f4

  // Top Accent Bar
  doc.setFillColor(emeraldPrimary[0], emeraldPrimary[1], emeraldPrimary[2]);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Header Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
  doc.text('KHAIRUL FRESH FOOD', margin, y);

  // Official Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(emeraldPrimary[0], emeraldPrimary[1], emeraldPrimary[2]);
  doc.roundedRect(pageWidth - margin - 35, y - 6, 35, 7, 1.5, 1.5, 'F');
  doc.text('RESIT RASMI', pageWidth - margin - 17.5, y - 1.5, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Gerai No. 59, Pasar Sementara Semenyih, 43500 Semenyih, Selangor', margin, y);
  y += 4;
  doc.text('WhatsApp: 011-11135503 | 100% Halal Diiktiraf & Bersih', margin, y);

  y += 5;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // Order Details & Date Box
  y += 6;
  const detailsBoxHeight = 26;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, y, contentWidth, detailsBoxHeight, 2, 2, 'F');

  // Left Column - Order IDs & Payment
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('NO. PESANAN', margin + 4, y + 5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
  doc.text(order.orderId, margin + 4, y + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('STATUS BAYARAN', margin + 4, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(emeraldPrimary[0], emeraldPrimary[1], emeraldPrimary[2]);
  const paymentMethodLabel = order.customer.paymentMethod === 'duitnow' 
    ? 'DuitNow QR (OCBC Bank)' 
    : 'LUNAS (HitPay Malaysia)';
  doc.text(paymentMethodLabel, margin + 4, y + 19.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Ref: ${order.customer.hitpayReference || order.orderId}`, margin + 4, y + 23.5);

  // Right Column - Dates & Delivery Slot
  const orderDateFormatted = new Date(order.createdAt).toLocaleString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Top Right: Order Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('TARIKH TEMPAHAN', pageWidth - margin - 4, y + 5, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(orderDateFormatted, pageWidth - margin - 4, y + 9.5, { align: 'right' });

  // Bottom Right: Slot Penghantaran (Title on top, delivery date & time slot below)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
  doc.text('SLOT PENGHANTARAN', pageWidth - margin - 4, y + 15, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(order.estimatedDeliveryText, pageWidth - margin - 4, y + 19.5, { align: 'right' });

  // Customer & Delivery Address Box
  y += detailsBoxHeight + 4;
  const colWidth = (contentWidth - 4) / 2;

  // Left column: Customer info
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, y, colWidth, 24, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
  doc.text('MAKLUMAT PELANGGAN', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Nama: ${order.customer.fullName}`, margin + 4, y + 11);
  doc.text(`No. Telefon: ${order.customer.phone}`, margin + 4, y + 16);
  if (order.customer.email) {
    doc.text(`Emel: ${order.customer.email}`, margin + 4, y + 21);
  }

  // Right column: Delivery address / pickup
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin + colWidth + 4, y, colWidth, 24, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
  doc.text(
    order.customer.fulfillmentType === 'pickup'
      ? 'PILIHAN PENGAMBILAN'
      : 'ALAMAT PENGHANTARAN',
    margin + colWidth + 8,
    y + 5
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  if (order.customer.fulfillmentType === 'pickup') {
    doc.text('Ambil Sendiri di Kedai (Self-Pickup)', margin + colWidth + 8, y + 11);
    doc.text('Gerai No 59, Pasar Sementara Semenyih', margin + colWidth + 8, y + 16);
    doc.text('Waktu Ambil: Sebelum 12:00 Tengah Hari', margin + colWidth + 8, y + 21);
  } else {
    const fullAddress = `${order.customer.address}, ${order.customer.postcode} ${order.customer.city}, ${order.customer.state || 'Selangor'}`;
    const splitAddr = doc.splitTextToSize(fullAddress, colWidth - 8);
    doc.text(splitAddr, margin + colWidth + 8, y + 10);
  }

  // Items Table Header
  y += 28;
  doc.setFillColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('BIL', margin + 3, y + 5);
  doc.text('ITEM / PERINCIAN POTONGAN', margin + 12, y + 5);
  doc.text('KUANTITI', pageWidth - margin - 50, y + 5, { align: 'center' });
  doc.text('HARGA/UNIT', pageWidth - margin - 26, y + 5, { align: 'right' });
  doc.text('JUMLAH (RM)', pageWidth - margin - 3, y + 5, { align: 'right' });

  y += 7;

  // Item Rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  order.items.forEach((item, index) => {
    const itemUnitPrice = item.selectedWeightOption
      ? item.selectedWeightOption.price
      : item.product.price;
    const itemTotal = item.itemTotalPrice;

    // Background zebra striping
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 249);
      doc.rect(margin, y, contentWidth, 12, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`${index + 1}.`, margin + 3, y + 5);
    doc.text(item.product.name, margin + 12, y + 5);

    // Cut & Details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    const cutDetails: string[] = [];
    if (item.selectedWeightOption) {
      cutDetails.push(`Saiz: ${item.selectedWeightOption.weightLabel}`);
    }
    if (item.product.supportsCutting && item.selectedCut) {
      cutDetails.push(`Potongan: ${getCutLabel(item.selectedCut, item.product)}`);
    }
    if (item.organVariationLabel) {
      cutDetails.push(`Pilihan: ${item.organVariationLabel}`);
    }
    if (item.specialNotes) {
      cutDetails.push(`Nota: ${item.specialNotes}`);
    }

    doc.text(cutDetails.join(' | ') || item.product.weightEstimate, margin + 12, y + 9.5);

    // Qty, unit price, and total
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`${item.quantity}`, pageWidth - margin - 50, y + 6, { align: 'center' });
    doc.text(itemUnitPrice.toFixed(2), pageWidth - margin - 26, y + 6, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(itemTotal.toFixed(2), pageWidth - margin - 3, y + 6, { align: 'right' });

    y += 12;

    // Check if new page is needed
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
  });

  // Table Bottom Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Calculation Breakdown Box (Right Aligned)
  const breakdownWidth = 85;
  const breakdownX = pageWidth - margin - breakdownWidth;

  const subtotal = order.items.reduce((s, i) => s + i.itemTotalPrice, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Nilai Item Ayam:', breakdownX, y + 4);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`RM ${subtotal.toFixed(2)}`, pageWidth - margin - 3, y + 4, { align: 'right' });

  y += 6;
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Caj Penghantaran:', breakdownX, y + 4);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(
    order.deliveryFee === 0 ? 'RM 0.00 (Percuma)' : `RM ${order.deliveryFee.toFixed(2)}`,
    pageWidth - margin - 3,
    y + 4,
    { align: 'right' }
  );

  if (order.discount && order.discount > 0) {
    y += 6;
    doc.setTextColor(emeraldPrimary[0], emeraldPrimary[1], emeraldPrimary[2]);
    doc.text('Diskaun Kupon / Promosi:', breakdownX, y + 4);
    doc.text(`- RM ${order.discount.toFixed(2)}`, pageWidth - margin - 3, y + 4, {
      align: 'right',
    });
  }

  y += 6;
  doc.setFillColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
  doc.roundedRect(breakdownX - 3, y, breakdownWidth + 3, 9, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('JUMLAH DIBAYAR:', breakdownX + 2, y + 6);
  doc.text(`RM ${order.total.toFixed(2)}`, pageWidth - margin - 3, y + 6, { align: 'right' });

  // Guarantee & Footer Notes
  y += 18;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
  doc.text('JAMINAN KUALITI & KESEGARAN KHAIRUL FRESH FOOD:', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    '• Ayam disembelih mengikut syarak (100% Halal Diiktiraf), diproses segar pada awal pagi hari penghantaran.',
    margin + 4,
    y + 9.5
  );
  doc.text(
    '• Penghantaran menggunakan pek dingin terkawal. Sila simpan terus dalam peti sejuk selepas penerimaan.',
    margin + 4,
    y + 14
  );

  // Bottom Footer Stamp
  y += 22;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'Resit ini dijana secara elektronik oleh sistem Khairul Fresh Food Direct. Tiada tandatangan fizikal diperlukan.',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  return doc;
}

/**
 * Downloads the PDF receipt directly to the customer's device.
 */
export function downloadReceiptPDF(order: OrderRecord): void {
  const doc = generateReceiptPDF(order);
  const fileName = `Resit-KhairulFreshFood-${order.orderId}.pdf`;
  doc.save(fileName);
}

/**
 * Shares the PDF receipt file to WhatsApp or other native messaging apps.
 * If Web Share API with files is supported (mobile/supported desktop), it sends the actual .pdf file.
 * If not supported, it downloads the PDF automatically and opens WhatsApp with the formatted receipt summary.
 */
export async function sendReceiptPDFToWhatsApp(
  order: OrderRecord,
  whatsappPhone: string = '601111135503'
): Promise<{ success: boolean; mode: 'shared_file' | 'downloaded_and_opened' }> {
  const doc = generateReceiptPDF(order);
  const fileName = `Resit-KhairulFreshFood-${order.orderId}.pdf`;
  const pdfBlob = doc.output('blob');
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

  const itemsList = order.items
    .map(
      (it) =>
        `• ${it.product.name} (x${it.quantity}) - ${getCutLabel(it.selectedCut, it.product)}`
    )
    .join('\n');

  const messageText = `Salam Khairul Fresh Food Direct,%0A%0ASaya ingin lampirkan resit pesanan rasmi saya (PDF):%0A*No. Pesanan:* ${order.orderId}%0A*Nama:* ${encodeURIComponent(order.customer.fullName)}%0A*Telefon:* ${order.customer.phone}%0A*Slot Penghantaran:* ${encodeURIComponent(order.estimatedDeliveryText)}%0A*Jumlah Bayaran (Lunas):* RM ${order.total.toFixed(2)}%0A%0A*Senarai Item:*%0A${encodeURIComponent(itemsList)}%0A%0ATerima kasih!`;

  // Check if native Web Share API with file support is available
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [pdfFile] })
  ) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: `Resit Pesanan ${order.orderId}`,
        text: `Resit Rasmi Pesanan ${order.orderId} - Khairul Fresh Food (Jumlah: RM ${order.total.toFixed(2)})`,
      });
      return { success: true, mode: 'shared_file' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, mode: 'shared_file' };
      }
      // If error occurs, fallback to download + WhatsApp open
    }
  }

  // Fallback for browsers that don't support file sharing via navigator.share:
  // 1. Download the PDF file directly to device
  doc.save(fileName);

  // 2. Open WhatsApp with pre-filled message
  const cleanPhone = whatsappPhone.replace(/[^0-9]/g, '');
  openWhatsAppSafe(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${messageText}`);

  return { success: true, mode: 'downloaded_and_opened' };
}
