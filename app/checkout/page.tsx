import { CheckoutClient } from "./_components/CheckoutClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | SubMS",
  description: "Secure checkout for Subscription Management System.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
