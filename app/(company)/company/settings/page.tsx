import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompanyInfoForm } from "@/components/features/company/settings/CompanyInfoForm";
import { ContactForm } from "@/components/features/company/settings/ContactForm";
import { LogoUploader } from "@/components/features/company/settings/LogoUploader";
import { SubscriptionSection } from "@/components/features/company/settings/SubscriptionSection";
import { Building2, Phone, ImageIcon, CreditCard } from "lucide-react";

export const metadata = {
  title: "Configuración | WorkLin Empresa",
};

async function getSettingsData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "company") redirect("/");

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!company) redirect("/onboarding");

  // Incluimos stripe_customer_id para poder mostrar/ocultar el botón del portal
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select(
      "snapshot_tier_name, snapshot_price, snapshot_currency, profiles_used, snapshot_profile_limit, started_at, expires_at, status, stripe_customer_id"
    )
    .eq("company_id", company.id)
    .eq("status", "active")
    .single();

  const canSubscribe =
    !subscription ||
    subscription.profiles_used >= subscription.snapshot_profile_limit;

  return { company, subscription: subscription ?? null, canSubscribe };
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="flex items-start gap-3 mb-6">
        <div
          className="p-2.5 rounded-xl flex-shrink-0"
          style={{ background: "rgba(139,92,246,0.15)" }}
        >
          <Icon size={18} className="text-violet-400" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">{title}</h2>
          <p className="text-white/40 text-sm mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default async function CompanySettingsPage() {
  const { company, subscription, canSubscribe } = await getSettingsData();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-white/40 text-sm mt-1">
          Gestiona el perfil y la suscripción de tu empresa
        </p>
      </div>

      <SettingsSection
        icon={ImageIcon}
        title="Logo de empresa"
        description="Imagen que verán los profesionales en tu perfil"
      >
        <LogoUploader
          currentLogoUrl={company.logo_url}
          companyId={company.id}
        />
      </SettingsSection>

      <SettingsSection
        icon={Building2}
        title="Información de empresa"
        description="Datos generales y ubicación de tu negocio"
      >
        <CompanyInfoForm
          initialData={{
            company_name: company.company_name,
            sector: company.sector,
            province_id: company.province_id,
            address: company.address,
            website: company.website,
          }}
        />
      </SettingsSection>

      <SettingsSection
        icon={Phone}
        title="Datos de contacto"
        description="Persona responsable del proceso de selección"
      >
        <ContactForm
          initialData={{
            contact_name: company.contact_name,
            contact_phone: company.contact_phone,
            contact_email: company.contact_email,
          }}
        />
      </SettingsSection>

      <SettingsSection
        icon={CreditCard}
        title="Suscripción"
        description="Estado de tu plan actual y opciones de pago"
      >
        <SubscriptionSection
          subscription={subscription}
          canSubscribe={canSubscribe}
        />
      </SettingsSection>
    </div>
  );
}