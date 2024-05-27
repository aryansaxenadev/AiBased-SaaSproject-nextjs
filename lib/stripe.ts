import Stripe from "stripe";

export const stripe = new Stripe("sk_test_51P8EAjSBAVAMHT0hUHl0JPildfaCDNFoXdHSnhs6r3pOIaroJi2KQnBku34cUHLFIbvtweWYnWm3mHSCdRSdSj1L00170PLUKQ", {
  apiVersion: "2022-11-15",
  typescript: true,
});
