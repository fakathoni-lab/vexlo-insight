import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#080808" }}>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold font-headline" style={{ color: "var(--text)" }}>{t('not_found.title')}</h1>
        <p className="mb-4 text-xl font-body" style={{ color: "var(--text-dim)" }}>{t('not_found.message')}</p>
        <a href="/" className="font-mono text-sm underline" style={{ color: "var(--accent)" }}>{t('not_found.cta')}</a>
      </div>
    </div>
  );
};

export default NotFound;
