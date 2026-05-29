import { z } from "zod";

// ---------------------------------------------------------------------------
// Domain union types
// ---------------------------------------------------------------------------

export type CookieColor = "pink" | "white" | "blue" | "yellow";
export type DeliveryMethod = "pickup" | "delivery";
export type OrderStatus = "pending" | "confirmed" | "ready" | "delivered";

// ---------------------------------------------------------------------------
// Const arrays (runtime values + narrow literal types)
// ---------------------------------------------------------------------------

export const COOKIE_COLORS = ["pink", "white", "blue", "yellow"] as const satisfies readonly CookieColor[];
export const ORDER_STATUSES = ["pending", "confirmed", "ready", "delivered"] as const satisfies readonly OrderStatus[];

// ---------------------------------------------------------------------------
// CreateOrderSchema
// ---------------------------------------------------------------------------

export const CreateOrderSchema = z
  .object({
    customerName: z.string().min(1).max(100),
    customerEmail: z.string().email(),
    cookieName: z.string().min(1).max(50),
    cookieColor: z.enum(["pink", "white", "blue", "yellow"]),
    quantity: z.number().int().min(1).max(500),
    deliveryMethod: z.enum(["pickup", "delivery"]),
    deadline: z.coerce.date(),
    shippingAddress: z.string().min(1).optional(),
    notes: z.string().optional(),
    personalizationLine1: z.string().max(22).optional(),
    personalizationLine2: z.string().max(14).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "delivery" && !data.shippingAddress) {
      ctx.addIssue({
        code: "custom",
        path: ["shippingAddress"],
        message: "shippingAddress is required when deliveryMethod is 'delivery'",
      });
    }
  });

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// ---------------------------------------------------------------------------
// UpdateOrderSchema
// ---------------------------------------------------------------------------

export const UpdateOrderSchema = z
  .object({
    status: z.enum(["pending", "confirmed", "ready", "delivered"]).optional(),
    readyDate: z.coerce.date().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => data.status !== undefined || data.readyDate !== undefined || data.notes !== undefined,
    { message: "At least one field (status, readyDate, or notes) must be provided" }
  );

export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
