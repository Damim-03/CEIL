import { useState, useEffect, useRef } from "react";
import { X, User, Loader2, Mail, Phone, Search, UserCheck } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAdminTeachers } from "../../../hooks/admin/useAdmin";

interface AssignInstructorModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (instructorId: string) => Promise<void>;
  isSubmitting?: boolean;
  currentInstructorId?: string | null;
}

const AssignInstructorModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  currentInstructorId,
}: AssignInstructorModalProps) => {
  const { data: teachers = [], isLoading: teachersLoading } =
    useAdminTeachers();

  const [selectedInstructorId, setSelectedInstructorId] = useState<
    string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setSelectedInstructorId(currentInstructorId || null);
      setSearchTerm("");
    }
  }, [open, currentInstructorId]);

  if (!open) return null;

  const handleClose = () => {
    setSelectedInstructorId(null);
    setSearchTerm("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructorId) return;

    await onSubmit(selectedInstructorId);
  };

  // Filter teachers
  const filteredTeachers = teachers.filter((teacher) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      teacher.first_name?.toLowerCase().includes(searchLower) ||
      teacher.last_name?.toLowerCase().includes(searchLower) ||
      teacher.email?.toLowerCase().includes(searchLower) ||
      teacher.teacher_id?.toLowerCase().includes(searchLower)
    );
  });

  const selectedTeacher = teachers.find(
    (t) => t.teacher_id === selectedInstructorId,
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Assign Instructor
                </h2>
                <p className="text-xs text-gray-500">
                  Select an instructor to assign to this group
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search instructors by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
              </div>

              {/* Selected Instructor Preview */}
              {selectedTeacher && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-medium text-green-700 mb-2">
                    Selected Instructor:
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {selectedTeacher.first_name} {selectedTeacher.last_name}
                      </p>
                      {selectedTeacher.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {selectedTeacher.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Instructors List */}
              {teachersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  <p className="ml-3 text-gray-500">Loading instructors...</p>
                </div>
              ) : filteredTeachers.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 mb-3">
                    Available Instructors ({filteredTeachers.length})
                  </p>
                  {filteredTeachers.map((teacher) => {
                    const isSelected =
                      selectedInstructorId === teacher.teacher_id;
                    const isCurrent =
                      currentInstructorId === teacher.teacher_id;

                    return (
                      <button
                        key={teacher.teacher_id}
                        type="button"
                        onClick={() =>
                          setSelectedInstructorId(teacher.teacher_id)
                        }
                        className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-green-100" : "bg-gray-100"
                          }`}
                        >
                          <User
                            className={`w-6 h-6 ${
                              isSelected ? "text-green-600" : "text-gray-500"
                            }`}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-semibold ${
                                isSelected ? "text-green-900" : "text-gray-900"
                              }`}
                            >
                              {teacher.first_name} {teacher.last_name}
                            </p>
                            {isCurrent && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {teacher.email && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {teacher.email}
                              </p>
                            )}
                            {teacher.phone && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {teacher.phone}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {teacher.teacher_id}
                          </p>
                        </div>

                        {/* Selection Indicator */}
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-green-500 bg-green-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">
                    {searchTerm
                      ? "No instructors match your search"
                      : "No instructors available"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchTerm
                      ? "Try a different search term"
                      : "Add instructors to assign them to groups"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4">
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedInstructorId}
                  className="gap-2 min-w-32 shadow-sm bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Assign Instructor
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AssignInstructorModal;
