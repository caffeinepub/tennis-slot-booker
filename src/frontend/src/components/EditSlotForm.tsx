import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TimeSlot } from "../backend";
import { useEditTimeSlot } from "../hooks/useQueries";

interface EditSlotFormProps {
  slot: TimeSlot;
  username: string;
  onClose: () => void;
}

const DURATION_OPTIONS = [
  { label: "30 minutes", value: "30" },
  { label: "1 hour", value: "60" },
  { label: "1.5 hours", value: "90" },
  { label: "2 hours", value: "120" },
];

const COURT_TYPES = ["Hard", "Clay", "Grass", "Synthetic"];

export function EditSlotForm({ slot, username, onClose }: EditSlotFormProps) {
  const [date, setDate] = useState(slot.date);
  const [time, setTime] = useState(slot.time);
  const [duration, setDuration] = useState(String(slot.durationMinutes));
  const [location, setLocation] = useState(slot.location);
  const [courtType, setCourtType] = useState(slot.courtType);
  const [notes, setNotes] = useState(slot.notes || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const editMutation = useEditTimeSlot();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!date) newErrors.date = "Date is required";
    if (!time) newErrors.time = "Time is required";
    if (!location.trim()) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const updatedSlot: TimeSlot = {
      ...slot,
      date,
      time,
      durationMinutes: BigInt(duration),
      location: location.trim(),
      courtType,
      notes: notes.trim() || undefined,
    };

    try {
      await editMutation.mutateAsync({
        slotId: slot.id,
        hostUsername: username,
        updatedSlot,
      });
      toast.success("Slot updated successfully!");
      onClose();
    } catch {
      toast.error("Failed to update slot. Please try again.");
    }
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <dialog
      data-ocid="edit_slot.dialog"
      open
      aria-label="Edit slot"
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 m-0 w-full h-full max-w-full max-h-full border-none"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-xl shadow-card p-6 w-full max-w-md space-y-4 animate-fade-in"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Edit Slot</h2>
          <button
            data-ocid="edit_slot.close_button"
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              data-ocid="edit_slot.input"
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={errors.date ? "border-destructive" : ""}
            />
            {errors.date && (
              <p
                data-ocid="edit_slot.error_state"
                className="text-xs text-destructive"
              >
                {errors.date}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-time">Time</Label>
            <Input
              id="edit-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={errors.time ? "border-destructive" : ""}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-location">Location</Label>
          <Input
            id="edit-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={errors.location ? "border-destructive" : ""}
          />
          {errors.location && (
            <p className="text-xs text-destructive">{errors.location}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Court Type</Label>
          <Select value={courtType} onValueChange={setCourtType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COURT_TYPES.map((ct) => (
                <SelectItem key={ct} value={ct}>
                  {ct}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-notes">
            Notes{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Textarea
            id="edit-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            data-ocid="edit_slot.cancel_button"
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="edit_slot.save_button"
            type="submit"
            className="flex-1 font-semibold"
            disabled={editMutation.isPending}
            style={{ background: "oklch(var(--tennis-green))" }}
          >
            {editMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
