import { useState } from "react";
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
  const [firstName, setFirstName] = useState(student.first_name || "");
  const [lastName, setLastName] = useState(student.last_name || "");
  const [email, setEmail] = useState(student.email || "");
  const [phone, setPhone] = useState(student.phone_number || "");

  // Local preview state for uploaded image
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

    // Create local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const formData = new FormData();
    formData.append("avatar", file);

    updateAvatar.mutate(
      {
        studentId: student.student_id,
        formData,
      },
      {
        onSuccess: () => {
          onSuccess();
          // Keep the preview until modal closes or refetch happens
        },
        onError: () => {
          // Revert preview on error
          setPreviewImage(null);
        },
      },
    );
  };

  // Determine which image to show
  const currentAvatar = previewImage || student.user?.google_avatar;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - FIXED GRADIENT */}
              <div className="relative bg-linear-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Edit Student Profile</h2>
                    <p className="text-blue-100 mt-1 text-sm">
                      Update student information and account settings
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
                  <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200">
                    <div className="relative group">
                      {/* Avatar Display - FIXED GRADIENT */}
                      {currentAvatar ? (
                        <img
                          src={currentAvatar}
                          alt="Student avatar"
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-2 ring-gray-200">
                          {student.first_name?.charAt(0) || "?"}
                          {student.last_name?.charAt(0) || ""}
                        </div>
                      )}

                      {/* Upload Overlay */}
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

                    {/* Upload Input */}
                    <div className="text-center">
                      <label
                        htmlFor="avatar-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm font-medium text-gray-700"
                      >
                        <ImageIcon className="w-4 h-4" />
                        {updateAvatar.isPending
                          ? "Uploading..."
                          : "Change Photo"}
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={updateAvatar.isPending}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG or GIF (max. 5MB)
                      </p>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        First Name
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        className="h-11"
                        required
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        Last Name
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        className="h-11"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                      >
                        <Mail className="w-4 h-4 text-gray-400" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="h-11"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                      >
                        <Phone className="w-4 h-4 text-gray-400" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={updateStudent.isPending}
                    className="min-w-25"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={
                      updateStudent.isPending || !firstName || !lastName
                    }
                    className="min-w-30 gap-2"
                  >
                    {updateStudent.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Save Changes
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
