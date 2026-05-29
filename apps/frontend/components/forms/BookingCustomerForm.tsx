"use client";

import { useState } from "react";

export function BookingCustomerForm() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="card grid"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <input required placeholder="Nombre" style={inputStyle} />
      <input required placeholder="Apellido" style={inputStyle} />
      <input required placeholder="Correo" type="email" style={inputStyle} />
      <input required placeholder="Telefono" style={inputStyle} />
      <button className="btn" type="submit">
        Continuar
      </button>
      {sent && <small style={{ color: "var(--muted)" }}>Datos guardados localmente (modo demo).</small>}
    </form>
  );
}

const inputStyle = {
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "0.7rem"
};
