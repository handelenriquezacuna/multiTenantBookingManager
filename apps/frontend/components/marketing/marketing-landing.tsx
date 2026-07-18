"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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

export function MarketingLanding() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.05 }
    }
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    }
  };

  return (
    <div data-ct className="min-h-screen bg-background font-sans text-foreground antialiased">
      {/* atmosfera: resplandor calido muy suave */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[-5%] top-[30%] h-[380px] w-[380px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <SiteHeader />

      {/* hero */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-6xl px-6 pb-10 pt-12 text-center md:pt-20"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Reservas para negocios de servicios
        </motion.span>

        <motion.h1
          variants={item}
          className="mx-auto mt-7 max-w-4xl text-balance pb-2 font-serif text-5xl font-medium leading-[1.08] tracking-tight md:text-7xl"
        >
          Reservas que fluyen,
          <br />
          negocios que <em className="italic text-primary">respiran</em>.
        </motion.h1>

        <motion.p variants={item} className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
          Servicios, horarios, disponibilidad y reservas en un solo lugar. Tus clientes agendan en
          segundos.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/register">Crear cuenta gratis</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/track">Seguir una reserva</Link>
          </Button>
        </motion.div>

        {/* maqueta de agenda con profundidad */}
        <motion.div
          variants={item}
          className="relative mx-auto mt-16 max-w-3xl rounded-3xl border border-border bg-card p-3 shadow-lift"
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
                <motion.div
                  key={row.time}
                  initial={{ opacity: 0, x: reduce ? 0 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.09, duration: 0.5 }}
                  className="flex items-center gap-4 rounded-xl border border-border/70 bg-card px-4 py-3"
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
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.section>

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
