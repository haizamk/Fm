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
 * Generates an official WhatsApp chat link with optional pre-filled message
 */
export function getOfficialWhatsAppLink(
  message: string = 'Salam Khairul Fresh Food, saya ingin bertanya mengenai pesanan ayam segar.',
  targetPhone: string = OFFICIAL_WHATSAPP_DIGITS
): string {
  const cleanNumber = normalizeWhatsAppPhone(targetPhone);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates a WhatsApp order message link for checkout / cart quick order
 */
export function getWhatsAppOrderLink(
  items: CartItem[],
  total: number,
  city: string = 'Semenyih',
  postcode: string = '43500'
): string {
  const itemsList = items
    .map(
      (it) =>
        `• ${it.product.name} (x${it.quantity}) - Potongan: ${it.selectedCut} - RM ${it.itemTotalPrice.toFixed(2)}`
    )
    .join('\n');

  const message = 
    `Salam Khairul Fresh Food,\n\n` +
    `Saya ingin membuat pesanan segar berikut:\n${itemsList}\n\n` +
    `Jumlah: RM ${total.toFixed(2)}\n` +
    `Lokasi Hantar: ${city} (${postcode})\n\n` +
    `Mohon bantuan pengesahan dan masa slot penghantaran. Terima kasih!`;

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
