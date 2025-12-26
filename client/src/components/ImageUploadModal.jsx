"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { MapPin, X, Upload, Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { API_URL } from "../lib/config"

// Helper: Compress Image (Moved here or keep as utility, but safe to duplicate or import if standard)
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Max dimensions
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1080;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Compress
                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                resolve(compressedBase64);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export function ImageUploadModal({ isOpen, onClose, barberData, setBarberData, barberId }) {
    const [uploading, setUploading] = useState(false);

    const shopImages = barberData?.images || [];

    const handleImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file");
            return;
        }

        setUploading(true);
        try {
            const compressed = await compressImage(file);
            const currentImages = [...shopImages];
            currentImages[index] = compressed;

            // Optimistic update
            const updatedBarber = { ...barberData, images: currentImages };
            setBarberData(updatedBarber);

            // Save to Server
            const res = await fetch(`${API_URL}/api/barbers/${barberId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ images: currentImages }),
            });

            if (!res.ok) throw new Error("Failed to save image");

        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload image.");
            // Revert on error would be ideal here
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async (index) => {
        if (!confirm("Remove this image?")) return;

        const currentImages = [...shopImages];
        currentImages.splice(index, 1);

        const updatedBarber = { ...barberData, images: currentImages };
        setBarberData(updatedBarber);

        try {
            await fetch(`${API_URL}/api/barbers/${barberId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ images: currentImages }),
            });
        } catch (err) {
            console.error("Remove error", err);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        Manage Shop Photos
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
                    {[0, 1, 2].map((index) => {
                        const imgDetails = shopImages[index];
                        return (
                            <div key={index} className="relative group aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 transition-colors">
                                {imgDetails ? (
                                    <>
                                        <img src={imgDetails} alt={`Shop ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition-transform hover:scale-110"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center gap-3 p-4 text-center w-full h-full justify-center hover:bg-gray-100 transition-colors">
                                        <div className="bg-white p-3 rounded-full shadow-sm">
                                            {uploading ? <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> : <Upload className="w-6 h-6 text-gray-400" />}
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold text-gray-700 block">
                                                {uploading ? "Uploading..." : "Click to Upload"}
                                            </span>
                                            <span className="text-xs text-gray-400 mt-1 block">Max 5MB</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e, index)}
                                            disabled={uploading}
                                        />
                                    </label>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 flex gap-2 items-start">
                    <div className="translate-y-0.5">ℹ️</div>
                    <p>
                        The <strong>first image</strong> in this list will be used as your main shop cover.
                        Adding multiple images will create a slideshow effect on your profile.
                    </p>
                </div>

                <div className="flex justify-end mt-2">
                    <Button onClick={() => onClose(false)}>
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
