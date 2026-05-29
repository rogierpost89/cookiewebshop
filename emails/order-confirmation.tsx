import { Html, Head, Body, Section, Text, Heading, Hr } from "@react-email/components";
import { Order } from "@prisma/client";

interface OrderConfirmationEmailProps {
  order: Order;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(date);

const deliveryMethodLabel = (method: string) =>
  method === "delivery" ? "Bezorging" : "Afhalen";

export const orderConfirmationSubject = "Bevestiging van je bestelling";

export default function OrderConfirmationEmail({ order }: OrderConfirmationEmailProps) {
  return (
    <Html lang="nl">
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", margin: 0, padding: 0 }}>
        <Section style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px" }}>
          <Heading as="h1" style={{ color: "#333333", fontSize: "24px", marginBottom: "8px" }}>
            Bedankt voor je bestelling!
          </Heading>
          <Text style={{ color: "#666666", fontSize: "15px", marginTop: 0 }}>
            Hoi {order.customerName}, we hebben je bestelling ontvangen en gaan er zo snel mogelijk mee aan de slag.
          </Text>

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />

          <Heading as="h2" style={{ color: "#333333", fontSize: "18px", marginBottom: "16px" }}>
            Jouw bestelling
          </Heading>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>Koekje:</strong> {order.cookieName}
          </Text>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>Kleur:</strong> {order.cookieColor}
          </Text>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>Aantal:</strong> {order.quantity}
          </Text>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>Deadline:</strong> {formatDate(order.deadline)}
          </Text>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>Leveringsmethode:</strong> {deliveryMethodLabel(order.deliveryMethod)}
          </Text>

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />

          <Heading as="h2" style={{ color: "#333333", fontSize: "18px", marginBottom: "16px" }}>
            Betaling
          </Heading>
          <Text style={{ color: "#333333", fontSize: "15px" }}>
            Je ontvangt binnenkort een Tikkie-betaalverzoek. Na ontvangst van je betaling gaan we aan de slag met je koekjes.
          </Text>

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />
          <Text style={{ color: "#999999", fontSize: "12px" }}>
            Bestelling ID: {order.id} — Besteld op {formatDate(order.createdAt)}
          </Text>
        </Section>
      </Body>
    </Html>
  );
}
