import { Html, Head, Body, Section, Text, Heading, Hr } from "@react-email/components";
import { Order } from "@prisma/client";

interface ReadyDateEmailProps {
  order: Order & { readyDate: Date };
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(date);

export const readyDateSubject = "Je koekjes zijn bijna klaar!";

export default function ReadyDateEmail({ order }: ReadyDateEmailProps) {
  return (
    <Html lang="nl">
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", margin: 0, padding: 0 }}>
        <Section style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px" }}>
          <Heading as="h1" style={{ color: "#333333", fontSize: "24px", marginBottom: "8px" }}>
            Goed nieuws, {order.customerName}!
          </Heading>
          <Text style={{ color: "#666666", fontSize: "15px", marginTop: 0 }}>
            Je koekjes zijn klaar op <strong>{formatDate(order.readyDate)}</strong>.
          </Text>

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />

          <Heading as="h2" style={{ color: "#333333", fontSize: "18px", marginBottom: "16px" }}>
            Volgende stappen
          </Heading>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            1. Je ontvangt binnenkort een Tikkie-betaalverzoek als je dat nog niet hebt ontvangen.
          </Text>
          {order.deliveryMethod === "delivery" ? (
            <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
              2. Na bevestiging van je betaling zorgen we ervoor dat je bestelling bij je wordt bezorgd op {formatDate(order.readyDate)}.
            </Text>
          ) : (
            <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
              2. Na bevestiging van je betaling kun je je koekjes ophalen op {formatDate(order.readyDate)}. We nemen contact met je op over de ophaallocatie en tijden.
            </Text>
          )}

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />
          <Text style={{ color: "#999999", fontSize: "12px" }}>
            Bestelling ID: {order.id}
          </Text>
        </Section>
      </Body>
    </Html>
  );
}
