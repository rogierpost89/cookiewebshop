import { Html, Head, Body, Section, Text, Heading, Hr } from "@react-email/components";
import { Order } from "@prisma/client";

interface NewOrderEmailProps {
  order: Order;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(date);

const deliveryMethodLabel = (method: string) =>
  method === "delivery" ? "Bezorging" : "Afhalen";

const decoThemeLabel = (key: string) => {
  switch (key) {
    case 'baby':    return '🍼 Babythema'
    case 'animals': return '🐾 Diertjes'
    case 'custom':  return '✏️ Anders'
    default:        return key
  }
}

export const newOrderSubject = "Nieuwe bestelling ontvangen";

export default function NewOrderEmail({ order }: NewOrderEmailProps) {
  const decoThemes = order.decorationThemes
    ? order.decorationThemes.split(',').filter(Boolean).map(decoThemeLabel).join(', ')
    : null

  return (
    <Html lang="nl">
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", margin: 0, padding: 0 }}>
        <Section style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px" }}>
          <Heading as="h1" style={{ color: "#333333", fontSize: "24px", marginBottom: "8px" }}>
            Nieuwe bestelling
          </Heading>
          <Text style={{ color: "#666666", fontSize: "14px", marginTop: 0 }}>
            Er is een nieuwe bestelling binnengekomen.
          </Text>

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />

          <Heading as="h2" style={{ color: "#333333", fontSize: "18px", marginBottom: "16px" }}>
            Klantgegevens
          </Heading>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>Naam:</strong> {order.customerName}
          </Text>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>E-mail:</strong> {order.customerEmail}
          </Text>

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />

          <Heading as="h2" style={{ color: "#333333", fontSize: "18px", marginBottom: "16px" }}>
            Besteldetails
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

          {(order.personalizationType === 'multiple' || order.personalizationLine1 || order.personalizationLine2 || decoThemes) && (
            <>
              <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />
              <Heading as="h2" style={{ color: "#333333", fontSize: "18px", marginBottom: "16px" }}>
                Personalisatie &amp; Decoratie
              </Heading>
              {order.personalizationType === 'multiple' ? (
                <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0", whiteSpace: "pre-line" }}>
                  <strong>Namen (verschillende):</strong>{"\n"}{order.namesInput}
                </Text>
              ) : (
                <>
                  {order.personalizationLine1 && (
                    <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
                      <strong>Tekst regel 1:</strong> {order.personalizationLine1}
                    </Text>
                  )}
                  {order.personalizationLine2 && (
                    <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
                      <strong>Tekst regel 2:</strong> {order.personalizationLine2}
                    </Text>
                  )}
                </>
              )}
              {decoThemes && (
                <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
                  <strong>Decoratie-thema:</strong> {decoThemes}
                </Text>
              )}
            </>
          )}

          {order.deliveryMethod === "delivery" && order.shippingAddress && (
            <>
              <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />
              <Heading as="h2" style={{ color: "#333333", fontSize: "18px", marginBottom: "16px" }}>
                Bezorgadres
              </Heading>
              <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
                {order.shippingAddress}
              </Text>
            </>
          )}

          {order.notes && (
            <>
              <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />
              <Heading as="h2" style={{ color: "#333333", fontSize: "18px", marginBottom: "16px" }}>
                Opmerkingen
              </Heading>
              <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
                {order.notes}
              </Text>
            </>
          )}

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />
          <Text style={{ color: "#999999", fontSize: "12px" }}>
            Bestelling ID: {order.id} — Ontvangen op {formatDate(order.createdAt)}
          </Text>
        </Section>
      </Body>
    </Html>
  );
}
