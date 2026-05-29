import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://mbm-booking.example"),
  title: {
    default: "MBM Booking Manager | Reservas multi tenant",
    template: "%s | MBM Booking Manager"
  },
  description: "Plataforma de reservas multi tenant para negocios de servicios.",
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "MBM Booking Manager",
    description: "Reservas multi tenant para negocios de servicios.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
