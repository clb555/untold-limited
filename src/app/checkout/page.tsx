import { redirect } from "next/navigation";

/**
 * The checkout flow uses Stripe Checkout (redirect mode).
 * Users are sent directly to Stripe from the API route.
 * If someone lands here directly, redirect them home.
 */
export default function CheckoutPage() {
  redirect("/");
}
