import Link from "next/link";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="public-shell">
      <header className="public-nav">
        <Link href="/" className="brand-mark" aria-label="Inicio Citari">
          Citari
        </Link>
        <nav className="public-nav-links" aria-label="Navegacion principal">
          <Link href="/book/clinica-dental-sonrisa">Demo de reserva</Link>
          <Link href="/track">Consultar reserva</Link>
          <Link href="/login">Iniciar sesion</Link>
          <Link className="nav-cta" href="/register">Solicitar acceso</Link>
        </nav>
      </header>
      <section className="public-content">{children}</section>
      <footer className="public-footer">
        <span>Citari</span>
        <nav aria-label="Enlaces secundarios">
          <Link href="/book/clinica-dental-sonrisa">Reserva demo</Link>
          <Link href="/track">Consultar reserva</Link>
          <Link href="/login">Panel del negocio</Link>
          <Link href="/register">Solicitar acceso</Link>
        </nav>
      </footer>
    </main>
  );
}
