import 'server-only';

import { Resend } from 'resend';
import { render } from '@react-email/components';
import { Order } from '@prisma/client';
import NewOrderEmail, { newOrderSubject } from '@/emails/new-order';
import OrderConfirmationEmail, { orderConfirmationSubject } from '@/emails/order-confirmation';
import ReadyDateEmail, { readyDateSubject } from '@/emails/ready-date';

if (!process.env.RESEND_FROM && process.env.NODE_ENV === 'production') {
  throw new Error('RESEND_FROM environment variable is not set in production')
}
const FROM_ADDRESS = process.env.RESEND_FROM ?? 'onboarding@resend.dev';
const DEFAULT_BAKER_EMAIL = process.env.BAKER_EMAIL ?? 'baker@example.com';
const REPLY_TO = process.env.REPLY_TO_EMAIL ?? 'daphnevrd@outlook.com';
const BCC = process.env.BCC_EMAIL ?? '';
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';

const resend = new Resend(RESEND_API_KEY);

export async function sendNewOrderEmail(order: Order): Promise<void> {
  if (!RESEND_API_KEY) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is not set in production');
    }

    console.warn('RESEND_API_KEY is not set; skipping email send in development.');
    return;
  }

  const html = await render(NewOrderEmail({ order }));
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: DEFAULT_BAKER_EMAIL,
    ...(BCC && { bcc: BCC }),
    subject: newOrderSubject,
    html,
  });
  if (error) {
    throw new Error(`Resend: ${error.name} – ${error.message}`);
  }
}

export async function sendOrderConfirmationEmail(
  order: Order,
  previewPng?: string | null
): Promise<void> {
  if (!RESEND_API_KEY) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is not set in production');
    }

    console.warn('RESEND_API_KEY is not set; skipping confirmation email in development.');
    return;
  }

  const html = await render(OrderConfirmationEmail({ order, previewPng }));
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: order.customerEmail,
    replyTo: REPLY_TO,
    ...(BCC && { bcc: BCC }),
    subject: orderConfirmationSubject,
    html,
  });
  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

export async function sendReadyDateEmail(order: Order): Promise<void> {
  if (!RESEND_API_KEY) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is not set in production');
    }

    console.warn('RESEND_API_KEY is not set; skipping ready-date email in development.');
    return;
  }

  if (order.readyDate === null) {
    throw new Error('order.readyDate is null');
  }
  const orderWithReadyDate = order as Order & { readyDate: Date };
  const html = await render(ReadyDateEmail({ order: orderWithReadyDate }));
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: order.customerEmail,
    replyTo: REPLY_TO,
    ...(BCC && { bcc: BCC }),
    subject: readyDateSubject,
    html,
  });
  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
