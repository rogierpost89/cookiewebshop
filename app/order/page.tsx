import OrderForm from './order-form'

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  return <OrderForm initialType={type ?? ''} />
}
