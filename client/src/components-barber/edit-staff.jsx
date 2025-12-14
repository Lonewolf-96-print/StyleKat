import { StaffForm } from "./staff-form";
import { X } from "lucide-react";

export default function EditStaffModal({ staff, onClose, onSave }) {

  const handleSuccess = (updatedData) => {
    // If null passed (cancel), just close
    if (!updatedData) {
      onClose();
      return;
    }
    onSave(updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Staff Member</h2>
            <p className="text-sm text-muted-foreground">Make changes to staff profile</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content - Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <StaffForm
            initialData={staff}
            onSuccess={handleSuccess}
            isModal={true}
          />
        </div>

      </div>
    </div>
  );
}
