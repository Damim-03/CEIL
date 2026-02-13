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
import type { Profile } from "../../../types/Types";

export default function Profile() {
  const { data: profile, isLoading, updateProfile } = useStudentProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "",
    dateOfBirth: "", gender: "", nationality: "", educationLevel: "",
    studyLocation: "", language: "", secondaryEmail: "",
  });

  if (isLoading) return <PageLoader />;

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#D8CDC0]/20 flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-[#BEB29E]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#1B1B1B]">Profile not found</h2>
          <p className="text-[#6B5D4F]">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setFormData({
      firstName: profile.first_name || "", lastName: profile.last_name || "",
      email: profile.email || "", phone: profile.phone_number || "",
      address: profile.address || "",
      dateOfBirth: profile.date_of_birth ? profile.date_of_birth.split("T")[0] : "",
      gender: profile.gender || "", nationality: profile.nationality || "",
      educationLevel: profile.education_level || "",
      studyLocation: profile.study_location || "",
      language: profile.language || "", secondaryEmail: profile.secondary_email || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => setIsEditing(false);

  const handleSave = () => {
    updateProfile.mutate(
      {
        first_name: formData.firstName, last_name: formData.lastName,
        phone_number: formData.phone, address: formData.address,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null, nationality: formData.nationality || null,
        education_level: formData.educationLevel || null,
        study_location: formData.studyLocation || null,
        language: formData.language || null, secondary_email: formData.secondaryEmail || null,
      },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const isSaving = updateProfile.isPending;
  const initials = profile.email ? profile.email.split("@")[0].slice(0, 2).toUpperCase() : "ST";
  const isProfileComplete = profile.is_profile_complete;

  const hasPersonalInfo = !!(
    profile.first_name && profile.last_name && profile.phone_number &&
    profile.date_of_birth && profile.gender && profile.nationality &&
    profile.education_level && profile.study_location && profile.language && profile.address
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B1B1B]">My Profile</h1>
              <p className="text-sm text-[#BEB29E] mt-0.5">Manage your personal information</p>
            </div>
          </div>

          {!isEditing ? (
            <Button onClick={handleEdit} className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl shadow-md shadow-[#2B6F5E]/20">
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" className="gap-2 border-[#D8CDC0]/60 text-[#6B5D4F] rounded-xl" disabled={isSaving}>
                <X className="w-4 h-4" /> Cancel
              </Button>
              <Button onClick={handleSave} className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl" disabled={isSaving}>
                <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Alert */}
      {!hasPersonalInfo && !isEditing && (
        <div className="bg-[#C4A035]/5 border border-[#C4A035]/20 rounded-2xl p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shrink-0 shadow-lg shadow-[#C4A035]/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#1B1B1B] mb-2">Complete Your Profile to Get Your Student ID</h3>
              <p className="text-sm text-[#6B5D4F] mb-3">Fill in all required fields to generate your digital student ID card and become eligible for course enrollment.</p>
              <Button size="sm" onClick={handleEdit} className="bg-[#C4A035] hover:bg-[#C4A035]/90 text-white rounded-xl">
                <Edit className="w-4 h-4 mr-2" /> Complete Profile Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 overflow-hidden">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2B6F5E] via-[#2B6F5E]/90 to-[#1a4a3d]"></div>
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}></div>
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#C4A035]/15 rounded-full blur-3xl"></div>

          <div className="relative px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#C4A035] via-white/30 to-[#8DB896] rounded-full opacity-40 blur-sm"></div>
                {profile.google_avatar ? (
                  <img src={profile.google_avatar} alt="Profile"
                    className="relative w-24 h-24 rounded-full border-[3px] border-white/90 shadow-xl object-cover ring-4 ring-white/10" />
                ) : (
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center text-white text-3xl font-bold border-[3px] border-white/90 shadow-xl ring-4 ring-white/10">
                    {initials}
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold text-white">
                  {profile.first_name || profile.last_name
                    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                    : profile.email.split("@")[0]}
                </h2>
                <p className="text-white/50 mt-1 text-sm">{profile.email}</p>

                <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#8DB896]/15 text-[#8DB896] border border-white/10 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8DB896]"></span> Student
                  </span>
                  {profile.student_id && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70 border border-white/10">
                      ID: {profile.student_id}
                    </span>
                  )}
                  {profile.status === "active" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70 border border-white/10">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  )}
                  {hasPersonalInfo && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#C4A035]/15 text-[#C4A035] border border-white/10">
                      <CheckCircle className="w-3 h-3" /> ID Card Ready
                    </span>
                  )}
                  {isProfileComplete && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#2B6F5E]/30 text-white/80 border border-white/10">
                      <CheckCircle className="w-3 h-3" /> Enrollment Ready
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-[#1B1B1B] uppercase tracking-wide mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-[#2B6F5E]" /> Personal Information
          </h3>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="First Name" placeholder="Enter your first name" value={formData.firstName} onChange={(v) => setFormData({ ...formData, firstName: v })} required />
              <InputField label="Last Name" placeholder="Enter your last name" value={formData.lastName} onChange={(v) => setFormData({ ...formData, lastName: v })} required />
              <InputField label="Email Address" value={formData.email} disabled helpText="Email cannot be changed" />
              <InputField label="Secondary Email" type="email" placeholder="Enter secondary email (optional)" value={formData.secondaryEmail} onChange={(v) => setFormData({ ...formData, secondaryEmail: v })} />
              <InputField label="Phone Number" type="tel" placeholder="Enter your phone number" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} required />
              <InputField label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(v) => setFormData({ ...formData, dateOfBirth: v })} required />
              <SelectField label="Gender" value={formData.gender} onChange={(v) => setFormData({ ...formData, gender: v })}
                options={[{ value: "", label: "Select gender" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" }]} required />
              <InputField label="Nationality" placeholder="Enter your nationality" value={formData.nationality} onChange={(v) => setFormData({ ...formData, nationality: v })} required />
              <SelectField label="Education Level" value={formData.educationLevel} onChange={(v) => setFormData({ ...formData, educationLevel: v })}
                options={[{ value: "", label: "Select education level" }, { value: "High School", label: "High School" }, { value: "Bachelor's Degree", label: "Bachelor's Degree" }, { value: "Master's Degree", label: "Master's Degree" }, { value: "Doctorate", label: "Doctorate" }, { value: "Other", label: "Other" }]} required />
              <InputField label="Study Location" placeholder="Enter your study location" value={formData.studyLocation} onChange={(v) => setFormData({ ...formData, studyLocation: v })} required />
              <InputField label="Language" placeholder="Enter your preferred language" value={formData.language} onChange={(v) => setFormData({ ...formData, language: v })} required />
              <InputField label="Address" placeholder="Enter your address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} full />
            </div>
          ) : (
            <InfoGrid profile={profile} />
          )}
        </div>

        {/* Account Information */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-semibold text-[#1B1B1B] uppercase tracking-wide mb-5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#C4A035]" /> Account Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#D8CDC0]/8 rounded-xl p-5 border border-[#D8CDC0]/30">
            <div>
              <p className="text-xs font-medium text-[#BEB29E] uppercase tracking-wider">Account Status</p>
              <div className="mt-1.5">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.status === "active" ? "bg-[#8DB896]/12 text-[#2B6F5E]" : "bg-[#D8CDC0]/20 text-[#6B5D4F]"
                }`}>{profile.status === "active" ? "Active" : profile.status || "Unknown"}</span>
              </div>
            </div>
            {profile.created_at && (
              <div>
                <p className="text-xs font-medium text-[#BEB29E] uppercase tracking-wider">Member Since</p>
                <p className="text-sm font-semibold text-[#1B1B1B] mt-1.5">
                  {new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-[#BEB29E] uppercase tracking-wider">Profile Completion</p>
              <div className="mt-1.5">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  hasPersonalInfo ? "bg-[#8DB896]/12 text-[#2B6F5E]" : "bg-[#C4A035]/8 text-[#C4A035]"
                }`}>{hasPersonalInfo ? "Complete" : "Incomplete"}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#BEB29E] uppercase tracking-wider">Enrollment Eligibility</p>
              <div className="mt-1.5">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isProfileComplete ? "bg-[#8DB896]/12 text-[#2B6F5E]" : "bg-red-50 text-red-700"
                }`}>{isProfileComplete ? "Eligible" : "Not Eligible"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function InputField({ label, value, onChange, type = "text", disabled = false, placeholder, helpText, full = false, required = false }:
  { label: string; value: string; onChange?: (v: string) => void; type?: string; disabled?: boolean; placeholder?: string; helpText?: string; full?: boolean; required?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-[#1B1B1B] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input type={type} value={value} disabled={disabled} placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={`border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20 rounded-xl ${disabled ? "bg-[#D8CDC0]/10 cursor-not-allowed" : ""}`} />
      {helpText && <p className="text-xs text-[#BEB29E] mt-1">{helpText}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, required = false }:
  { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1B1B1B] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-[#D8CDC0]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 focus:border-[#2B6F5E]">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function InfoGrid({ profile }: { profile: Profile }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <InfoItem icon={User} label="Full Name" color="#2B6F5E">
        {profile.first_name || profile.last_name ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "—"}
      </InfoItem>
      <InfoItem icon={Mail} label="Email Address" color="#C4A035">{profile.email}</InfoItem>
      {profile.secondary_email && <InfoItem icon={Mail} label="Secondary Email" color="#C4A035">{profile.secondary_email}</InfoItem>}
      <InfoItem icon={Phone} label="Phone Number" color="#8DB896">{profile.phone_number || "—"}</InfoItem>
      <InfoItem icon={Calendar} label="Date of Birth" color="#C4A035">
        {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
      </InfoItem>
      <InfoItem icon={Users} label="Gender" color="#6B5D4F">{profile.gender || "—"}</InfoItem>
      <InfoItem icon={Globe} label="Nationality" color="#2B6F5E">{profile.nationality || "—"}</InfoItem>
      <InfoItem icon={GraduationCap} label="Education Level" color="#C4A035">{profile.education_level || "—"}</InfoItem>
      <InfoItem icon={MapPinned} label="Study Location" color="#2B6F5E">{profile.study_location || "—"}</InfoItem>
      <InfoItem icon={Languages} label="Language" color="#8DB896">{profile.language || "—"}</InfoItem>
      <InfoItem icon={MapPin} label="Address" color="#6B5D4F" full>{profile.address || "—"}</InfoItem>
    </div>
  );
}

function InfoItem({ icon: Icon, label, children, color = "#2B6F5E", full = false }:
  { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode; color?: string; full?: boolean }) {
  return (
    <div className={`group flex items-start gap-3 p-3 rounded-xl hover:bg-[#D8CDC0]/5 transition-colors ${full ? "md:col-span-2" : ""}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
        style={{ backgroundColor: `${color}10` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#BEB29E] uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-[#1B1B1B] mt-0.5 break-words">{children}</p>
      </div>
    </div>
  );
}