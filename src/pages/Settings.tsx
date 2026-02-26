import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";

const Settings = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#080808" }}>
      <SEO title="Settings — VEXLO" description="Manage your VEXLO account settings." canonical="https://vexloai.com/settings" />
      <p className="font-body" style={{ color: "rgba(240,240,238,0.45)" }}>{t('settings.placeholder')}</p>
    </div>
  );
};

export default Settings;
