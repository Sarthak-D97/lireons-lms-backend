import ThemeSettingsForm from './theme-settings-form';
import { getActiveBrandingTheme } from '@/lib/academy-data';

export default async function ThemeSettingsPage() {
  const theme = await getActiveBrandingTheme();

  return (
    <div className="page-shell container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <p className="chip mb-3">Organization Settings</p>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-950 dark:text-white mb-3">Theme Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 leading-8 max-w-2xl">
          Update branding from your `OrganizationSettings` table and apply colors and typography across the academy app.
        </p>
      </div>

      <ThemeSettingsForm
        initialValues={{
          serviceName: theme.serviceName,
          logoUrl: theme.logoUrl ?? '',
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          fontFamily: theme.fontFamily,
          fontSize: theme.fontSize,
        }}
      />
    </div>
  );
}
