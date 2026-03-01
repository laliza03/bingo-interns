"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { Activity } from "@/types";

interface ActivityModalProps {
  activity: Activity;
  onSubmit: (activityId: string, image: File | null, completed: boolean) => Promise<void>;
  onClose: () => void;
}

export default function ActivityModal({ activity, onSubmit, onClose }: ActivityModalProps) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activity.requiresImage && !image) {
      setError("This activity requires an image.");
      return;
    }

    if (!completed) {
      setError("Please mark the activity as completed.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onSubmit(activity.id, image, completed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{activity.title}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Description */}
        <p className="modal-description">{activity.description}</p>

        <form onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}

          {/* Image upload */}
          {activity.requiresImage && (
            <div className="modal-field">
              <label htmlFor="activity-image">
                Upload image <span className="modal-required">*required</span>
              </label>
              <div className="modal-file-zone" onClick={() => fileInputRef.current?.click()}>
                {preview ? (
                  <div className="modal-preview-wrapper">
                    <img src={preview} alt="Preview" className="modal-preview-img" />
                    <button
                      type="button"
                      className="modal-preview-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="modal-file-placeholder">
                    <span className="modal-file-icon">📷</span>
                    <span>Click to upload an image</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                id="activity-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
          )}

          {/* Completed checkbox */}
          <label className="modal-checkbox-label">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="modal-checkbox"
            />
            <span>I have completed this activity</span>
          </label>

          {/* Submit */}
          <button className="btn btn-primary modal-submit-btn" type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
