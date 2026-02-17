import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  X,
  Upload,
  User,
  Mail,
  Phone,
  CheckCircle,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import {
  useUpdateStudent,
  useUpdateStudentAvatar,
} from "../../../hooks/admin/useAdmin";
import type { AdminStudent } from "../../../hooks/admin/useAdmin";

interface EditStudentModalProps {
  open: boolean;
  onClose: () => void;
  student: AdminStudent;
  onSuccess: () => void;
}

const EditStudentModal = ({
  open,
  onClose,
  student,
  onSuccess,
}: EditStudentModalProps) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState(student.first_name || "");
  const [lastName, setLastName] = useState(student.last_name || "");
  const [email, setEmail] = useState(student.email || "");
  const [phone, setPhone] = useState(student.phone_number || "");

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const updateStudent = useUpdateStudent();
  const updateAvatar = useUpdateStudentAvatar();

  const handleSave = () => {
    updateStudent.mutate(
      {
        studentId: student.student_id,
        payload: {
          first_name: firstName,
          last_name: lastName,
          email: email || undefined,
          phone_number: phone || undefined,
        },
      },
      {
        onSuccess: () => {
          onSuccess();
          onClose();
        },
      },
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("avatar", file);

    updateAvatar.mutate(
      {
        studentId: student.student_id,
        formData,
      },
      {
        onSuccess: () => onSuccess(),
        onError: () => setPreviewImage(null),
      },
    );
  };

  const currentAvatar = previewImage || student.user?.google_avatar;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-2xl shadow-2xl dark:shadow-black/50 overflow-hidden pointer-events-auto border border-transparent dark:border-[#2A2A2A]"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-[#2B6F5E] via-[#2B6F5E]/90 to-[#2B6F5E]/80 px-6 py-8 text-white overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#C4A035]/15 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C4A035] via-[#C4A035]/60 to-transparent"></div>
                <div className="relative flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {t("admin.studentDetails.editProfile", {
                        defaultValue: "Edit Student Profile",
                      })}
                    </h2>
                    <p className="text-white/60 mt-1 text-sm">
                      {t("admin.studentDetails.editProfileDesc", {
                        defaultValue:
                          "Update student information and account settings",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-4 pb-6 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
                    <div className="relative group">
                      {currentAvatar ? (
                        <img
                          src={currentAvatar}
                          alt="Student avatar"
                          className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#1A1A1A] shadow-lg ring-2 ring-[#D8CDC0]/40 dark:ring-[#2A2A2A]"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-2 ring-[#D8CDC0]/40 dark:ring-[#2A2A2A]">
                          {student.first_name?.charAt(0) || "?"}
                          {student.last_name?.charAt(0) || ""}
                        </div>
                      )}
                      <label
                        htmlFor="avatar-upload"
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        {updateAvatar.isPending ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6 text-white" />
                        )}
                      </label>
                    </div>

                    <div className="text-center">
                      <label
                        htmlFor="avatar-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#D8CDC0]/15 dark:bg-[#222222] hover:bg-[#D8CDC0]/25 dark:hover:bg-[#2A2A2A] rounded-lg cursor-pointer transition-colors text-sm font-medium text-[#6B5D4F] dark:text-[#AAAAAA]"
                      >
                        <ImageIcon className="w-4 h-4" />
                        {updateAvatar.isPending
                          ? t("common.uploading", {
                              defaultValue: "Uploading...",
                            })
                          : t("admin.studentDetails.changePhoto", {
                              defaultValue: "Change Photo",
                            })}
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={updateAvatar.isPending}
                        className="hidden"
                      />
                      <p className="text-xs text-[#BEB29E] dark:text-[#666666] mt-2">
                        JPG, PNG or GIF (max. 5MB)
                      </p>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="flex items-center gap-2 text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]"
                      >
                        <User className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
                        {t("admin.studentDetails.firstName", {
                          defaultValue: "First Name",
                        })}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={t("admin.studentDetails.enterFirstName", {
                          defaultValue: "Enter first name",
                        })}
                        className="h-11 border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/20"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="flex items-center gap-2 text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]"
                      >
                        <User className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
                        {t("admin.studentDetails.lastName", {
                          defaultValue: "Last Name",
                        })}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={t("admin.studentDetails.enterLastName", {
                          defaultValue: "Enter last name",
                        })}
                        className="h-11 border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/20"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="flex items-center gap-2 text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]"
                      >
                        <Mail className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
                        {t("admin.studentDetails.emailAddress", {
                          defaultValue: "Email Address",
                        })}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="h-11 border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="flex items-center gap-2 text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]"
                      >
                        <Phone className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
                        {t("admin.studentDetails.phoneNumber", {
                          defaultValue: "Phone Number",
                        })}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+213 555 000 000"
                        className="h-11 border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#D8CDC0]/8 dark:bg-[#0F0F0F] px-6 py-4 border-t border-[#D8CDC0]/30 dark:border-[#2A2A2A] flex items-center justify-between gap-4">
                <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                  <span className="text-red-500">*</span>{" "}
                  {t("common.requiredFields", {
                    defaultValue: "Required fields",
                  })}
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={updateStudent.isPending}
                    className="min-w-[100px] border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222]"
                  >
                    {t("common.cancel", { defaultValue: "Cancel" })}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={
                      updateStudent.isPending || !firstName || !lastName
                    }
                    className="min-w-[120px] gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 dark:bg-[#2B6F5E] dark:hover:bg-[#2B6F5E]/80 text-white shadow-md shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10"
                  >
                    {updateStudent.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("common.saving", { defaultValue: "Saving..." })}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {t("common.saveChanges", {
                          defaultValue: "Save Changes",
                        })}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditStudentModal;
