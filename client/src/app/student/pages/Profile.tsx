import { useState } from "react";
import PageLoader from "../../../components/PageLoader";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Shield,
  CheckCircle,
  Globe,
  GraduationCap,
  MapPinned,
  Languages,
  Users,
} from "lucide-react";
import { useStudentProfile } from "../../../hooks/student/Usestudent";
import type { Profile } from "../../../types/profile";

export default function Profile() {
  const { data: profile, isLoading, updateProfile } = useStudentProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    educationLevel: "",
    studyLocation: "",
    language: "",
    secondaryEmail: "",
  });

  if (isLoading) return <PageLoader />;

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center space-y-4">
          <div className="text-6xl">📋</div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Profile not found
          </h2>
          <p className="text-gray-600">
            Unable to load your profile information.
          </p>
        </div>
      </div>
    );
  }

  /* ================= HANDLERS ================= */

  const handleEdit = () => {
    setFormData({
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      email: profile.email || "",
      phone: profile.phone_number || "",
      address: profile.address || "",
      dateOfBirth: profile.date_of_birth
        ? profile.date_of_birth.split("T")[0]
        : "",
      gender: profile.gender || "",
      nationality: profile.nationality || "",
      educationLevel: profile.education_level || "",
      studyLocation: profile.study_location || "",
      language: profile.language || "",
      secondaryEmail: profile.secondary_email || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    updateProfile.mutate(
      {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phone,
        address: formData.address,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        nationality: formData.nationality || null,
        education_level: formData.educationLevel || null,
        study_location: formData.studyLocation || null,
        language: formData.language || null,
        secondary_email: formData.secondaryEmail || null,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const isSaving = updateProfile.isPending;

  const initials = profile.email
    ? profile.email.split("@")[0].slice(0, 2).toUpperCase()
    : "ST";

  // Check if profile is complete for enrollment (requires documents too)
  const isProfileComplete = profile.is_profile_complete;

  // Check if personal information is complete (for showing ID card)
  // Student ID card should show when all personal fields are filled
  const hasPersonalInfo = !!(
    profile.first_name &&
    profile.last_name &&
    profile.phone_number &&
    profile.date_of_birth &&
    profile.gender &&
    profile.nationality &&
    profile.education_level &&
    profile.study_location &&
    profile.language &&
    profile.address
  );

  /* ================= RENDER ================= */

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>

        {!isEditing ? (
          <Button onClick={handleEdit} className="gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="gap-2"
              disabled={isSaving}
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Enrollment Eligibility Alert - Only show if personal info is incomplete */}
      {!hasPersonalInfo && !isEditing && (
        <div className="bg-linear-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                ⚠️ Complete Your Profile to Get Your Student ID
              </h3>
              <p className="text-sm text-amber-700 mb-3">
                Fill in all required fields to generate your digital student ID
                card and become eligible for course enrollment.
              </p>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
                onClick={handleEdit}
              >
                <Edit className="w-4 h-4 mr-2" />
                Complete Profile Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-8 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {profile.google_avatar ? (
                <img
                  src={profile.google_avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                  {initials}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.first_name || profile.last_name
                  ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                  : profile.email.split("@")[0]}
              </h2>
              <p className="text-gray-600 mt-1">{profile.email}</p>

              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <Shield className="w-3 h-3 mr-1" />
                  Student
                </span>
                {profile.student_id && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    ID: {profile.student_id}
                  </span>
                )}
                {profile.status === "active" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </span>
                )}
                {hasPersonalInfo && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    ID Card Ready
                  </span>
                )}
                {isProfileComplete && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enrollment Ready
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
          </h3>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(v) => setFormData({ ...formData, firstName: v })}
                required
              />
              <InputField
                label="Last Name"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(v) => setFormData({ ...formData, lastName: v })}
                required
              />
              <InputField
                label="Email Address"
                value={formData.email}
                disabled
                helpText="Email cannot be changed"
              />
              <InputField
                label="Secondary Email"
                type="email"
                placeholder="Enter secondary email (optional)"
                value={formData.secondaryEmail}
                onChange={(v) =>
                  setFormData({ ...formData, secondaryEmail: v })
                }
              />
              <InputField
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(v) => setFormData({ ...formData, phone: v })}
                required
              />
              <InputField
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
                required
              />
              <SelectField
                label="Gender"
                value={formData.gender}
                onChange={(v) => setFormData({ ...formData, gender: v })}
                options={[
                  { value: "", label: "Select gender" },
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
                required
              />
              <InputField
                label="Nationality"
                placeholder="Enter your nationality"
                value={formData.nationality}
                onChange={(v) => setFormData({ ...formData, nationality: v })}
                required
              />
              <SelectField
                label="Education Level"
                value={formData.educationLevel}
                onChange={(v) =>
                  setFormData({ ...formData, educationLevel: v })
                }
                options={[
                  { value: "", label: "Select education level" },
                  { value: "High School", label: "High School" },
                  { value: "Bachelor's Degree", label: "Bachelor's Degree" },
                  { value: "Master's Degree", label: "Master's Degree" },
                  { value: "Doctorate", label: "Doctorate" },
                  { value: "Other", label: "Other" },
                ]}
                required
              />
              <InputField
                label="Study Location"
                placeholder="Enter your study location"
                value={formData.studyLocation}
                onChange={(v) => setFormData({ ...formData, studyLocation: v })}
                required
              />
              <InputField
                label="Language"
                placeholder="Enter your preferred language"
                value={formData.language}
                onChange={(v) => setFormData({ ...formData, language: v })}
                required
              />
              <InputField
                label="Address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={(v) => setFormData({ ...formData, address: v })}
                full
              />
            </div>
          ) : (
            <InfoGrid profile={profile} />
          )}
        </div>

        {/* Account Information Section */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Account Status
              </p>
              <p className="text-base text-gray-900 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {profile.status === "active"
                    ? "Active"
                    : profile.status || "Unknown"}
                </span>
              </p>
            </div>
            {profile.created_at && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Member Since
                </p>
                <p className="text-base text-gray-900 mt-1">
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">
                Profile Completion
              </p>
              <p className="text-base text-gray-900 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    hasPersonalInfo
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {hasPersonalInfo ? "Complete" : "Incomplete"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Enrollment Eligibility
              </p>
              <p className="text-base text-gray-900 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isProfileComplete
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {isProfileComplete ? "Eligible" : "Not Eligible"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function InputField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder,
  helpText,
  full = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  full?: boolean;
  required?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={disabled ? "bg-gray-50 cursor-not-allowed" : ""}
      />
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function InfoGrid({ profile }: { profile: Profile }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoItem icon={User} label="Full Name" color="blue">
        {profile.first_name || profile.last_name
          ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
          : "—"}
      </InfoItem>

      <InfoItem icon={Mail} label="Email Address" color="purple">
        {profile.email}
      </InfoItem>

      {profile.secondary_email && (
        <InfoItem icon={Mail} label="Secondary Email" color="purple">
          {profile.secondary_email}
        </InfoItem>
      )}

      <InfoItem icon={Phone} label="Phone Number" color="green">
        {profile.phone_number || "—"}
      </InfoItem>

      <InfoItem icon={Calendar} label="Date of Birth" color="orange">
        {profile.date_of_birth
          ? new Date(profile.date_of_birth).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "—"}
      </InfoItem>

      <InfoItem icon={Users} label="Gender" color="pink">
        {profile.gender || "—"}
      </InfoItem>

      <InfoItem icon={Globe} label="Nationality" color="teal">
        {profile.nationality || "—"}
      </InfoItem>

      <InfoItem icon={GraduationCap} label="Education Level" color="indigo">
        {profile.education_level || "—"}
      </InfoItem>

      <InfoItem icon={MapPinned} label="Study Location" color="cyan">
        {profile.study_location || "—"}
      </InfoItem>

      <InfoItem icon={Languages} label="Language" color="violet">
        {profile.language || "—"}
      </InfoItem>

      <InfoItem icon={MapPin} label="Address" color="gray" full>
        {profile.address || "—"}
      </InfoItem>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  children,
  color = "blue",
  full = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
  color?: string;
  full?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    indigo: "bg-indigo-100 text-indigo-600",
    pink: "bg-pink-100 text-pink-600",
    teal: "bg-teal-100 text-teal-600",
    cyan: "bg-cyan-100 text-cyan-600",
    violet: "bg-violet-100 text-violet-600",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <div className={`flex items-start gap-3 ${full ? "md:col-span-2" : ""}`}>
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClasses[color] || colorClasses.blue}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-base text-gray-900 mt-1 wrap-break-word">
          {children}
        </p>
      </div>
    </div>
  );
}