import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

const sectors = ["Clinicas", "Barberias", "Salones", "Spas", "Veterinarias", "Consultorios", "Centros esteticos"];

const agenda = [
  { time: "09:00", name: "Handel Enriquez", service: "Limpieza dental", tone: "confirmada" },
  { time: "10:30", name: "Isaac Chaves", service: "Consulta", tone: "pendiente" },
  { time: "12:00", name: "Luna Delgado", service: "Blanqueamiento", tone: "confirmada" },
  { time: "15:00", name: "Andrew Fuentes", service: "Revision", tone: "pendiente" }
];

// Entrada por CSS (tailwindcss-animate): determinista, sin mismatch de hydration.
const reveal = "animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700 motion-reduce:animate-none";

export function MarketingLanding() {
  return (
    <div data-ct className="min-h-screen bg-background font-sans text-foreground antialiased">
      {/* atmosfera: resplandor calido muy suave */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[-5%] top-[30%] h-[380px] w-[380px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <SiteHeader />

      {/* hero */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-12 text-center md:pt-20">
        <span
          className={`inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft ${reveal}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Reservas para negocios de servicios
        </span>

        <h1
          className={`mx-auto mt-7 max-w-4xl text-balance pb-2 font-serif text-5xl font-medium leading-[1.08] tracking-tight md:text-7xl ${reveal}`}
          style={{ animationDelay: "80ms" }}
        >
          Reservas que fluyen,
          <br />
          negocios que <em className="italic text-primary">respiran</em>.
        </h1>

        <p
          className={`mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground ${reveal}`}
          style={{ animationDelay: "160ms" }}
        >
          Servicios, horarios, disponibilidad y reservas en un solo lugar. Tus clientes agendan en
          segundos.
        </p>

        <div
          className={`mt-9 flex flex-wrap items-center justify-center gap-3 ${reveal}`}
          style={{ animationDelay: "240ms" }}
        >
          <Button asChild size="lg">
            <Link href="/register">Crear cuenta gratis</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/track">Seguir una reserva</Link>
          </Button>
        </div>

        {/* maqueta de agenda con profundidad */}
        <div
          className={`relative mx-auto mt-16 max-w-3xl rounded-3xl border border-border bg-card p-3 shadow-lift ${reveal}`}
          style={{ animationDelay: "320ms" }}
        >
          <div className="rounded-2xl bg-background/60 p-5 text-left">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Agenda de hoy</p>
                <p className="font-serif text-xl">Barberia El Colocho</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Negocio activo
              </span>
            </div>
            <div className="space-y-2">
              {agenda.map((row, i) => (
                <div
                  key={row.time}
                  className="flex items-center gap-4 rounded-xl border border-border/70 bg-card px-4 py-3 animate-in fade-in slide-in-from-left-2 fill-mode-both duration-500 motion-reduce:animate-none"
                  style={{ animationDelay: `${520 + i * 90}ms` }}
                >
                  <span className="w-14 font-mono text-sm text-muted-foreground">{row.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{row.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{row.service}</p>
                  </div>
                  <span
                    className={
                      row.tone === "confirmada"
                        ? "rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary"
                        : "rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
                    }
                  >
                    {row.tone}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* sectores */}
      <section id="sectores" className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">Pensado para negocios de servicios</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {sectors.map((s) => (
            <span key={s} className="font-serif text-xl text-foreground/70">{s}</span>
          ))}
        </div>
      </section>

      {/* cta */}
      <section id="reservar" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-16 text-center text-background shadow-lift">
          <div className="pointer-events-none absolute inset-0 -z-0">
            <div className="absolute left-1/2 top-full h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/30 blur-[100px]" />
          </div>
          <h2 className="relative mx-auto max-w-2xl pb-1 font-serif text-4xl font-medium tracking-tight md:text-5xl">
            Tu agenda lista <em className="italic text-primary">hoy</em>.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-background/70">
            Crea tu negocio, define servicios y horarios, y empieza a recibir reservas sin
            complicaciones.
          </p>
          <div className="relative mt-8">
            <Button asChild size="lg" variant="default">
              <Link href="/register">Empezar gratis</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
