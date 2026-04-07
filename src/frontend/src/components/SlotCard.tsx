import { Button } from "@/components/ui/button";
import {
  Clock,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import type { TimeSlot } from "../backend";

interface SlotCardProps {
  slot: TimeSlot;
  currentUsername: string;
  onBook?: (slotId: bigint) => void;
  onEdit?: (slot: TimeSlot) => void;
  onDelete?: (slotId: bigint) => void;
  onCancel?: (slotId: bigint) => void;
  onCancelAsHost?: (slotId: bigint) => void;
  isBooking?: boolean;
  isDeleting?: boolean;
  isCancelling?: boolean;
  isCancellingAsHost?: boolean;
  showManageButtons?: boolean;
  showCancelButton?: boolean;
  index?: number;
}

function formatDuration(minutes: bigint): string {
  const mins = Number(minutes);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTimeRange(timeStr: string, durationMinutes: bigint): string {
  const [h, m] = timeStr.split(":").map(Number);
  const start = new Date(2000, 0, 1, h, m);
  const end = new Date(start.getTime() + Number(durationMinutes) * 60000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

export function SlotCard({
  slot,
  currentUsername,
  onBook,
  onEdit,
  onDelete,
  onCancel,
  onCancelAsHost,
  isBooking = false,
  isDeleting = false,
  isCancelling = false,
  isCancellingAsHost = false,
  showManageButtons = false,
  showCancelButton = false,
  index = 0,
}: SlotCardProps) {
  const isAvailable = slot.status === "available";
  const isHost = currentUsername === slot.hostUsername;
  const canBook = isAvailable && !isHost && !!currentUsername;

  const scope = `slot.item.${index + 1}`;

  return (
    <div
      data-ocid={scope}
      className="bg-card rounded-xl shadow-card overflow-hidden flex flex-col animate-fade-in"
    >
      {/* Green header band */}
      <div
        className="relative px-4 py-3 flex items-start justify-between"
        style={{ background: "oklch(var(--tennis-green))" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none select-none">🎾</span>
          <div>
            <p className="text-white/80 text-xs font-medium tracking-wide uppercase">
              {formatDate(slot.date)}
            </p>
            <p className="text-white font-bold text-base leading-tight">
              {formatTimeRange(slot.time, slot.durationMinutes)}
            </p>
          </div>
        </div>
        {/* Status badge */}
        <span
          className="text-white text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: isAvailable
              ? "oklch(var(--available))"
              : "oklch(var(--booked))",
          }}
        >
          {isAvailable ? "Available" : "Booked"}
        </span>
      </div>

      {/* Card body */}
      <div className="px-4 py-3 flex-1 flex flex-col gap-2">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="text-sm truncate">{slot.location}</span>
        </div>

        {/* Duration + Court type */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="text-sm">
            {formatDuration(slot.durationMinutes)}
          </span>
          <span className="text-muted-foreground/50 mx-1">·</span>
          <span className="text-sm">{slot.courtType}</span>
        </div>

        {/* Host */}
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "oklch(var(--tennis-green-dark))" }}
          >
            {getInitial(slot.hostUsername)}
          </div>
          <span className="text-sm text-foreground font-medium">
            {slot.hostUsername}
          </span>
          {isHost && (
            <span className="text-xs text-muted-foreground italic ml-1">
              (you)
            </span>
          )}
        </div>

        {/* Notes */}
        {slot.notes && (
          <p className="text-xs text-muted-foreground italic line-clamp-2 mt-0.5">
            {slot.notes}
          </p>
        )}

        {/* Booker info */}
        {!isAvailable && slot.bookerUsername && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Booked by <strong>{slot.bookerUsername}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-4 pb-4 pt-1">
        {/* Booker cancels their own booking */}
        {showCancelButton && !isAvailable ? (
          <Button
            data-ocid={`slot.cancel_button.${index + 1}`}
            size="sm"
            variant="outline"
            className="w-full gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onCancel?.(slot.id)}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {isCancelling ? "Cancelling..." : "Cancel Booking"}
          </Button>
        ) : showManageButtons ? (
          <div className="flex flex-col gap-2">
            {isAvailable && (
              <div className="flex gap-2">
                <Button
                  data-ocid={`slot.edit_button.${index + 1}`}
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1"
                  onClick={() => onEdit?.(slot)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  data-ocid={`slot.delete_button.${index + 1}`}
                  size="sm"
                  variant="destructive"
                  className="flex-1 gap-1"
                  onClick={() => onDelete?.(slot.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </Button>
              </div>
            )}
            {!isAvailable && (
              <Button
                data-ocid={`slot.cancel_as_host_button.${index + 1}`}
                size="sm"
                variant="outline"
                className="w-full gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onCancelAsHost?.(slot.id)}
                disabled={isCancellingAsHost}
              >
                {isCancellingAsHost ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {isCancellingAsHost ? "Cancelling..." : "Cancel Booking"}
              </Button>
            )}
          </div>
        ) : (
          <Button
            data-ocid={`slot.primary_button.${index + 1}`}
            className="w-full font-semibold text-sm"
            disabled={!canBook || isBooking}
            onClick={() => canBook && onBook?.(slot.id)}
            style={{
              background: canBook ? "oklch(var(--tennis-green))" : undefined,
            }}
          >
            {isBooking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Booking...
              </>
            ) : isAvailable ? (
              isHost ? (
                "Your Slot"
              ) : !currentUsername ? (
                "Set nickname to book"
              ) : (
                "Book Slot"
              )
            ) : (
              "Booked"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
