import Link from "next/link";
import { PrivateShell } from "@/components/layout/PrivateShell";
import { tenantFieldLabels, tenantStatusLabels } from "@/lib/labels";
import { mockTenant } from "@/lib/mock-data";

export default function BusinessSettingsPage() {
  return (
    <PrivateShell>
      <div className="page-header">
        <div>
          <h1>Configuracion del negocio</h1>
          <p>Actualiza la informacion publica que ven tus clientes al entrar a tu pagina de reservas.</p>
        </div>
        <Link className="btn secondary" href={`/book/${mockTenant.slug}`}>Ver pagina publica</Link>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Perfil publico</h2>
          <span className="tenant-state active">{tenantStatusLabels.active}</span>
        </div>
        <form className="panel-body settings-form">
          <label className="field-group">
            <span>{tenantFieldLabels.name}</span>
            <input defaultValue={mockTenant.name} />
          </label>
          <label className="field-group">
            <span>{tenantFieldLabels.slug}</span>
            <input defaultValue={mockTenant.slug} />
            <small className="field-helper">Vista previa: /book/{mockTenant.slug}</small>
          </label>
          <label className="field-group">
            <span>{tenantFieldLabels.email}</span>
            <input defaultValue="contacto@barberiaelite.com" type="email" />
          </label>
          <label className="field-group">
            <span>{tenantFieldLabels.phone}</span>
            <input defaultValue="8888-1010" />
          </label>
          <label className="field-group settings-full">
            <span>{tenantFieldLabels.description}</span>
            <textarea defaultValue={mockTenant.description} rows={4} />
          </label>
          <label className="field-group settings-full">
            <span>{tenantFieldLabels.publicMessage}</span>
            <textarea defaultValue={mockTenant.publicMessage} rows={3} />
          </label>
          <label className="field-group settings-full">
            <span>{tenantFieldLabels.logoUrl}</span>
            <input placeholder="https://example.com/logo.png" />
          </label>
          <div className="settings-actions">
            <button className="btn secondary" type="button">Cancelar</button>
            <button className="btn" type="button">Guardar cambios</button>
          </div>
        </form>
      </section>
    </PrivateShell>
  );
}
