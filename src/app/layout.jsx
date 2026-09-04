import "./globals.css";
import "./App.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "animate.css";
import Script from "next/script";
import Providers from "./providers";

export const metadata = {
  title: "PicShop",
  description: "PicShop — ecommerce storefront with visual product search",
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  // Required for env(safe-area-inset-*) to report real values on notched
  // phones — the fixed cart checkout bar relies on it via .safe-area-pb.
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Script src="https://js.stripe.com/v3/" strategy="afterInteractive" />
      </body>
    </html>
  );
}
