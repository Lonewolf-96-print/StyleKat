import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components-barber/ui/textarea"
import { X } from "lucide-react";

export const ServiceEditModal = ({ service, onClose, onSave }) => {
  const [name, setName] = useState(service?.name || "");
  const [price, setPrice] = useState(service?.price || "");
  const [duration, setDuration] = useState(service?.duration || "");
  const [description, setDescription] = useState(service?.description || "");
  const [category, setCategory] = useState(service?.category || "Hair");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...service, name, price, duration, description, category });
    onClose();
  };

  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Background blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Service</h2>
            <p className="text-sm text-muted-foreground">Modify service details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto">
          <form id="service-edit-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">min</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Hair, Beard, Facial"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="Describe the service..."
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 shrink-0 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="service-edit-form">Save Changes</Button>
        </div>
      </div>
    </div>
  );
};
