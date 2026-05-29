import Link from "next/link";

export function BookingShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="booking-shell">
      <section className="booking-shell-content">{children}</section>
      <footer className="powered-footer">
        <Link href="/">Powered by MBM</Link>
      </footer>
    </main>
  );
}
