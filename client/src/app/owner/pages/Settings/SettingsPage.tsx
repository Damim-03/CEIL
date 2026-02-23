/* ===============================================================
   SettingsPage.tsx — Owner: System Settings
   
   📁 src/app/owner/pages/Settings/SettingsPage.tsx
=============================================================== */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  useSystemSettings,
  useUpdateSettings,
} from "../../../../hooks/owner/Useowner.hooks";
import { Settings, Save, RotateCcw } from "lucide-react";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useSystemSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Sync form with fetched data
  useEffect(() => {
    if (data?.settings) {
      setForm(data.settings);
      setHasChanges(false);
    }
  }, [data]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings.mutate(form, {
      onSuccess: () => setHasChanges(false),
    });
  };

  const handleReset = () => {
    if (data?.settings) {
      setForm(data.settings);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-[#D4A843]" />
      </div>
    );
  }

  // Group settings by category
  const settingsGroups = [
    {
      title: t("owner.settings.general", "General"),
      keys: ["site_name", "site_name_ar"],
    },
    {
      title: t("owner.settings.academic", "Academic"),
      keys: ["max_enrollments_per_student", "default_group_capacity"],
    },
    {
      title: t("owner.settings.finance", "Finance"),
      keys: ["fee_due_days"],
    },
    {
      title: t("owner.settings.system", "System"),
      keys: ["registration_open", "maintenance_mode"],
    },
  ];

  const booleanKeys = ["registration_open", "maintenance_mode"];

  return (
    <div className="space-y-6">
      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A843] to-[#B8912E] flex items-center justify-center shadow-md shadow-[#D4A843]/20">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {t("owner.settings.title", "System Settings")}
            </h1>
            <p className="text-sm text-[#BEB29E] dark:text-[#666666]">
              {t("owner.settings.subtitle", "Configure platform behavior")}
            </p>
          </div>
        </div>

        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="btn btn-ghost btn-sm gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              {t("common.reset", "Reset")}
            </button>
            <button
              onClick={handleSave}
              disabled={updateSettings.isPending}
              className="btn btn-sm bg-[#D4A843] hover:bg-[#B8912E] text-white border-none gap-1"
            >
              {updateSettings.isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t("common.save", "Save")}
            </button>
          </div>
        )}
      </div>

      {/* ═══ Settings Groups ═══ */}
      <div className="space-y-6">
        {settingsGroups.map((group) => (
          <div
            key={group.title}
            className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] p-5"
          >
            <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-4">
              {group.title}
            </h3>
            <div className="space-y-4">
              {group.keys.map((key) => {
                if (!(key in form)) return null;
                const isBool = booleanKeys.includes(key);
                const label = key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#1B1B1B] dark:text-[#E5E5E5]">
                        {label}
                      </p>
                      <p className="text-[11px] text-[#BEB29E] dark:text-[#555555]">
                        {key}
                      </p>
                    </div>
                    {isBool ? (
                      <input
                        type="checkbox"
                        checked={form[key] === "true"}
                        onChange={(e) =>
                          handleChange(key, e.target.checked ? "true" : "false")
                        }
                        className="toggle toggle-sm toggle-warning"
                      />
                    ) : (
                      <input
                        type="text"
                        value={form[key] || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="input input-bordered input-sm w-48 bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Other/Custom Settings */}
        {Object.keys(form).filter(
          (k) => !settingsGroups.flatMap((g) => g.keys).includes(k),
        ).length > 0 && (
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] p-5">
            <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-4">
              {t("owner.settings.other", "Other")}
            </h3>
            <div className="space-y-4">
              {Object.keys(form)
                .filter(
                  (k) => !settingsGroups.flatMap((g) => g.keys).includes(k),
                )
                .map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#1B1B1B] dark:text-[#E5E5E5]">
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                    </div>
                    <input
                      type="text"
                      value={form[key] || ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="input input-bordered input-sm w-48 bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
