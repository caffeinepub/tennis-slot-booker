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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TimeSlot } from "../backend";
import { useCreateTimeSlot } from "../hooks/useQueries";

interface PostSlotFormProps {
  username: string;
  onSuccess: () => void;
}

const DURATION_OPTIONS = [
  { label: "30 minutes", value: "30" },
  { label: "1 hour", value: "60" },
  { label: "1.5 hours", value: "90" },
  { label: "2 hours", value: "120" },
];

const COURT_TYPES = ["Hard", "Clay", "Grass", "Synthetic"];

export function PostSlotForm({ username, onSuccess }: PostSlotFormProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [location, setLocation] = useState("");
  const [courtType, setCourtType] = useState("Hard");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateTimeSlot();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!date) newErrors.date = "Date is required";
    else {
      const selected = new Date(`${date}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today)
        newErrors.date = "Date must be today or in the future";
    }
    if (!time) newErrors.time = "Time is required";
    if (!location.trim()) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const slot: TimeSlot = {
      id: 0n,
      status: "available",
      date,
      time,
      hostUsername: username,
      durationMinutes: BigInt(duration),
      notes: notes.trim() || undefined,
      location: location.trim(),
      bookerUsername: undefined,
      courtType,
    };

    try {
      await createMutation.mutateAsync(slot);
      toast.success("Slot posted successfully!");
      setDate("");
      setTime("");
      setDuration("60");
      setLocation("");
      setCourtType("Hard");
      setNotes("");
      setErrors({});
      onSuccess();
    } catch {
      toast.error("Failed to post slot. Please try again.");
    }
  };

  return (
    <form
      data-ocid="post_slot.panel"
      onSubmit={handleSubmit}
      className="space-y-5 max-w-lg mx-auto bg-card rounded-xl shadow-card p-6"
    >
      <div className="mb-2">
        <h2 className="text-xl font-bold text-foreground">Post a Time Slot</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Share your available court time with other players.
        </p>
      </div>

      {/* Date + Time row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            data-ocid="post_slot.input"
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className={errors.date ? "border-destructive" : ""}
          />
          {errors.date && (
            <p
              data-ocid="post_slot.error_state"
              className="text-xs text-destructive"
            >
              {errors.date}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={errors.time ? "border-destructive" : ""}
          />
          {errors.time && (
            <p className="text-xs text-destructive">{errors.time}</p>
          )}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <Label>Duration</Label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger data-ocid="post_slot.select">
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

      {/* Location */}
      <div className="space-y-1.5">
        <Label htmlFor="location">Location / Court Name</Label>
        <Input
          id="location"
          type="text"
          placeholder="e.g. Riverside Tennis Club – Court 3"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={errors.location ? "border-destructive" : ""}
        />
        {errors.location && (
          <p className="text-xs text-destructive">{errors.location}</p>
        )}
      </div>

      {/* Court Type */}
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

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">
          Notes{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          data-ocid="post_slot.textarea"
          id="notes"
          placeholder="Any additional info — skill level, equipment available, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <Button
        data-ocid="post_slot.submit_button"
        type="submit"
        className="w-full font-semibold"
        disabled={createMutation.isPending}
        style={{ background: "oklch(var(--tennis-green))" }}
      >
        {createMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Posting...
          </>
        ) : (
          "Post Slot"
        )}
      </Button>
    </form>
  );
}
