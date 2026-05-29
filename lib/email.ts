import 'server-only';

import { Resend } from 'resend';
import { Order } from '@prisma/client';
import NewOrderEmail, { newOrderSubject } from '@/emails/new-order';
import OrderConfirmationEmail, { orderConfirmationSubject } from '@/emails/order-confirmation';
import ReadyDateEmail, { readyDateSubject } from '@/emails/ready-date';

// TODO: replace with verified sender domain
const FROM_ADDRESS = 'onboarding@resend.dev';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNewOrderEmail(order: Order): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: process.env.BAKER_EMAIL!,
    subject: newOrderSubject,
    react: NewOrderEmail({ order }),
  });
  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

export async function sendOrderConfirmationEmail(
  order: Order,
  previewPng?: string | null
): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: order.customerEmail,
    subject: orderConfirmationSubject,
    react: OrderConfirmationEmail({ order, previewPng }),
  });
  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

export async function sendReadyDateEmail(order: Order): Promise<void> {
  if (order.readyDate === null) {
    throw new Error('order.readyDate is null');
  }
  const orderWithReadyDate = order as Order & { readyDate: Date };
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: order.customerEmail,
    subject: readyDateSubject,
    react: ReadyDateEmail({ order: orderWithReadyDate }),
  });
  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
