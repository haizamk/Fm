/**
 * WhatsApp Link Generation & Contact Helper Utility
 * Centralizes the official store WhatsApp hotline (011-11135503 / +601111135503)
 * across all contact buttons, order submissions, and status notifications.
 */

import { CartItem, OrderRecord } from '../types';

export const OFFICIAL_WHATSAPP_DISPLAY = '011-11135503';
export const OFFICIAL_WHATSAPP_DIGITS = '601111135503';

/**
 * Normalizes any Malaysian phone number to the standard international format (e.g. 601111135503)
 */
export function normalizeWhatsAppPhone(phone: string = OFFICIAL_WHATSAPP_DISPLAY): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return OFFICIAL_WHATSAPP_DIGITS;
  if (digits.startsWith('60')) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return '60' + digits.slice(1);
  }
  return '60' + digits;
}

/**
 * Robust helper to safely open WhatsApp web/app even inside sandboxes or iframes
 */
export function openWhatsAppSafe(url: string): void {
  if (typeof window === 'undefined') return;

  try {
    const newWin = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
      // Pop-up blocker or iframe restriction: fallback to direct location or invisible anchor
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch {
    // Ultimate fallback: open in top/self window
    window.location.href = url;
  }
}

/**
 * Generates an official WhatsApp chat link with the 4 mandatory user questions
 */
export function getOfficialWhatsAppLink(
  message?: string,
  targetPhone: string = OFFICIAL_WHATSAPP_DIGITS
): string {
  const cleanNumber = normalizeWhatsAppPhone(targetPhone);
  
  const default4QuestionsMessage = 
    `Salam Khairul Fresh Food! Saya ingin membuat tempahan ayam segar:\n\n` +
    `*BORANG TEMPAHAN AYAM SEGAR*\n` +
    `--------------------------------------------------\n` +
    `1. *Nama Customer*:\n` +
    `   [ Sila isi nama anda ]\n\n` +
    `2. *Produk Ayam Apa?*:\n` +
    `   • Ayam Segar Standard (Ekor)\n` +
    `   • Ayam Kampung (Ekor)\n` +
    `   • Dada Fillet / Whole Leg / Kepak\n` +
    `   [ Sila potong: Potong 4 / 8 / 12 / 16 / Cincang ]\n\n` +
    `3. *Lokasi Penghantaran atau Ambik di Pasar?*:\n` +
    `   [ Penghantaran ke Rumah / Ambik Sendiri di Gerai GA 59 Pasar Awam Semenyih ]\n\n` +
    `4. *Bila Nak Hantar / Masa Pickup?*:\n` +
    `   [ Sila nyatakan tarikh & masa pilihan anda ]\n` +
    `--------------------------------------------------\n\n` +
    `Mohon maklumkan ketersediaan stok & total harga. Terima kasih!`;

  const finalMessage = message || default4QuestionsMessage;
  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(finalMessage)}`;
}

/**
 * Generates a WhatsApp order message link adhering to the 4 mandatory questions
 */
export function getWhatsAppOrderLink(
  items: CartItem[],
  total: number,
  city: string = 'Semenyih',
  postcode: string = '43500',
  customerName: string = '',
  deliveryTimeText: string = 'Hari Ini / Segera'
): string {
  const itemsList = items
    .map(
      (it) =>
        `• ${it.product.name} (x${it.quantity}) - Potongan: ${it.selectedCut} [RM ${it.itemTotalPrice.toFixed(2)}]`
    )
    .join('\n   ');

  const message = 
    `Salam Khairul Fresh Food! Saya nak sahkan tempahan berikut:\n\n` +
    `*BORANG TEMPAHAN AYAM SEGAR*\n` +
    `--------------------------------------------------\n` +
    `1. *Nama Customer*:\n` +
    `   ${customerName.trim() || '[ Sila isi nama anda ]'}\n\n` +
    `2. *Produk Ayam & Kuantiti*:\n` +
    `   ${itemsList}\n` +
    `   *JUMLAH ANGGARAN*: RM ${total.toFixed(2)}\n\n` +
    `3. *Lokasi Penghantaran atau Ambik di Pasar*:\n` +
    `   Penghantaran ke ${city} (${postcode})\n\n` +
    `4. *Bila Nak Hantar / Masa*:\n` +
    `   ${deliveryTimeText}\n` +
    `--------------------------------------------------\n\n` +
    `Mohon pengesahan tempahan ini. Terima kasih!`;

  return getOfficialWhatsAppLink(message, OFFICIAL_WHATSAPP_DIGITS);
}

/**
 * Generates a WhatsApp order status inquiry link
 */
export function getWhatsAppOrderStatusLink(
  orderId: string,
  customerName?: string
): string {
  const message = customerName
    ? `Salam Khairul Fresh Food, saya ${customerName} ingin semak status pesanan #${orderId}.`
    : `Salam Khairul Fresh Food, saya ingin tanya status pesanan #${orderId}.`;
  
  return getOfficialWhatsAppLink(message, OFFICIAL_WHATSAPP_DIGITS);
}

/**
 * Generates a WhatsApp order confirmation link with full receipt breakdown
 */
export function getWhatsAppOrderConfirmationLink(order: OrderRecord): string {
  const itemsList = order.items
    .map(
      (it) =>
        `• ${it.product.name} (x${it.quantity}) - Potongan: ${it.selectedCut}${
          it.specialNotes ? ` [Nota: ${it.specialNotes}]` : ''
        }`
    )
    .join('\n');

  const deliveryNoteText = order.customer.deliveryInstructions 
    ? `\n*Arahan Hantar:* ${order.customer.deliveryInstructions}` 
    : '';

  const message = 
    `Salam Khairul Fresh Food,\n\n` +
    `Saya ingin sahkan pesanan saya:\n` +
    `*No. Pesanan:* #${order.orderId}\n` +
    `*Nama:* ${order.customer.fullName}\n` +
    `*Telefon:* ${order.customer.phone}\n` +
    (order.fulfillmentType === 'pickup' 
      ? `*Kaedah:* Self-Pickup di Gerai GA 59 Pasar Semenyih (Sebelum 12:00 PM)\n` 
      : `*Alamat:* ${order.customer.address}, ${order.customer.postcode} ${order.customer.city}\n`) +
    `*Slot Penghantaran:* ${order.estimatedDeliveryText}${deliveryNoteText}\n` +
    `*Kaedah Bayaran:* ${order.customer.paymentMethod.toUpperCase()}\n\n` +
    `*Senarai Item:*\n${itemsList}\n\n` +
    `*Jumlah Bayaran:* RM ${order.total.toFixed(2)}\n\n` +
    `Terima kasih!`;

  return getOfficialWhatsAppLink(message, OFFICIAL_WHATSAPP_DIGITS);
}
