import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Save, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { TimeSlot } from "./backend";
import { EditSlotForm } from "./components/EditSlotForm";
import { PostSlotForm } from "./components/PostSlotForm";
import { SlotCard } from "./components/SlotCard";
import {
  useBookSlot,
  useCancelBooking,
  useCancelSlotAsHost,
  useDeleteTimeSlot,
  useGetAllTimeSlots,
  useGetProfileComment,
  useGetSlotsByUsername,
  useSetProfileComment,
} from "./hooks/useQueries";

type Tab = "browse" | "post" | "bookings";

const STORAGE_KEY = "tennis_username";

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

// ──────────────────────────────────────────────
// Sample slots injected into browse view on empty
// ──────────────────────────────────────────────
const SAMPLE_SLOTS: TimeSlot[] = [
  {
    id: -1n,
    status: "available",
    date: "2026-04-10",
    time: "09:00",
    hostUsername: "Alex Rivera",
    durationMinutes: 60n,
    location: "Riverside Tennis Club – Court 1",
    courtType: "Hard",
    notes: "Looking for a fun rally partner. Any skill level welcome!",
  },
  {
    id: -2n,
    status: "available",
    date: "2026-04-11",
    time: "07:30",
    hostUsername: "Sam Cho",
    durationMinutes: 90n,
    location: "Greenwood Park Courts – Court 4",
    courtType: "Clay",
  },
  {
    id: -3n,
    status: "booked",
    date: "2026-04-12",
    time: "11:00",
    hostUsername: "Maria Jensen",
    durationMinutes: 60n,
    location: "City Sports Center – Court 2",
    courtType: "Synthetic",
    bookerUsername: "Tom Wells",
  },
  {
    id: -4n,
    status: "available",
    date: "2026-04-13",
    time: "18:00",
    hostUsername: "David Park",
    durationMinutes: 120n,
    location: "Lakeside Tennis Academy – Court 5",
    courtType: "Grass",
    notes: "Intermediate/advanced players preferred. Bring your own racquet.",
  },
  {
    id: -5n,
    status: "available",
    date: "2026-04-14",
    time: "06:30",
    hostUsername: "Priya Nair",
    durationMinutes: 60n,
    location: "Hillcrest Club – Court 3",
    courtType: "Hard",
  },
  {
    id: -6n,
    status: "available",
    date: "2026-04-15",
    time: "15:00",
    hostUsername: "James O'Brien",
    durationMinutes: 90n,
    location: "Sundown Courts – Court 2",
    courtType: "Clay",
    notes: "Doubles format — bring a partner if you can!",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [username, setUsername] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || "",
  );
  const [nicknameInput, setNicknameInput] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || "",
  );
  const [profileComment, setProfileComment] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [showCommentEditor, setShowCommentEditor] = useState(false);
  const [locationFilter, setLocationFilter] = useState("all");
  const [courtFilter, setCourtFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [bookingId, setBookingId] = useState<bigint | null>(null);
  const [cancellingId, setCancellingId] = useState<bigint | null>(null);
  const [cancellingHostId, setCancellingHostId] = useState<bigint | null>(null);

  const { data: allSlots = [], isLoading: isLoadingAll } = useGetAllTimeSlots();
  const { data: mySlots = [], isLoading: isLoadingMine } =
    useGetSlotsByUsername(username);
  const { data: fetchedComment } = useGetProfileComment(username);

  const bookMutation = useBookSlot();
  const cancelMutation = useCancelBooking();
  const cancelHostMutation = useCancelSlotAsHost();
  const deleteMutation = useDeleteTimeSlot();
  const setCommentMutation = useSetProfileComment();

  // Sync fetched comment into local state
  useEffect(() => {
    if (fetchedComment !== undefined) {
      setProfileComment(fetchedComment);
      setCommentInput(fetchedComment);
    }
  }, [fetchedComment]);

  const handleSetNickname = () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed) {
      toast.error("Please enter a nickname.");
      return;
    }
    setUsername(trimmed);
    localStorage.setItem(STORAGE_KEY, trimmed);
    toast.success(`Welcome, ${trimmed}!`);
  };

  const handleSaveComment = async () => {
    if (!username) return;
    try {
      await setCommentMutation.mutateAsync({
        username,
        comment: commentInput,
      });
      setProfileComment(commentInput);
      setShowCommentEditor(false);
      toast.success("Profile comment saved!");
    } catch {
      toast.error("Failed to save comment. Please try again.");
    }
  };

  const handleBook = async (slotId: bigint) => {
    if (!username) {
      toast.error("Set a nickname first to book a slot.");
      return;
    }
    setBookingId(slotId);
    try {
      await bookMutation.mutateAsync({ slotId, bookerUsername: username });
      toast.success("Slot booked successfully!");
    } catch {
      toast.error("Failed to book slot. Please try again.");
    } finally {
      setBookingId(null);
    }
  };

  const handleCancel = async (slotId: bigint) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(slotId);
    try {
      await cancelMutation.mutateAsync({ slotId, bookerUsername: username });
      toast.success("Booking cancelled.");
    } catch {
      toast.error("Failed to cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancelAsHost = async (slotId: bigint) => {
    if (!confirm("Cancel this booking? The slot will become available again."))
      return;
    setCancellingHostId(slotId);
    try {
      await cancelHostMutation.mutateAsync({ slotId, hostUsername: username });
      toast.success("Booking cancelled. Slot is now available again.");
    } catch {
      toast.error("Failed to cancel booking. Please try again.");
    } finally {
      setCancellingHostId(null);
    }
  };

  const handleDelete = async (slotId: bigint) => {
    if (!confirm("Are you sure you want to delete this slot?")) return;
    setDeletingId(slotId);
    try {
      await deleteMutation.mutateAsync({ slotId, hostUsername: username });
      toast.success("Slot deleted.");
    } catch {
      toast.error("Failed to delete slot.");
    } finally {
      setDeletingId(null);
    }
  };

  // Merge backend slots with sample slots (sample slots shown when backend is empty)
  const displaySlots = useMemo(() => {
    if (allSlots.length > 0) return allSlots;
    return SAMPLE_SLOTS;
  }, [allSlots]);

  // Unique locations and court types for filters
  const locations = useMemo(() => {
    const locs = [...new Set(displaySlots.map((s) => s.location))];
    return locs;
  }, [displaySlots]);

  const courtTypes = useMemo(() => {
    const types = [...new Set(displaySlots.map((s) => s.courtType))];
    return types;
  }, [displaySlots]);

  const filteredSlots = useMemo(() => {
    return displaySlots.filter((s) => {
      if (locationFilter !== "all" && s.location !== locationFilter)
        return false;
      if (courtFilter !== "all" && s.courtType !== courtFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !s.location.toLowerCase().includes(q) &&
          !s.hostUsername.toLowerCase().includes(q) &&
          !s.courtType.toLowerCase().includes(q) &&
          !(s.notes || "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [displaySlots, locationFilter, courtFilter, searchQuery]);

  const postedSlots = useMemo(
    () => mySlots.filter((s) => s.hostUsername === username),
    [mySlots, username],
  );

  const bookedSlots = useMemo(
    () => mySlots.filter((s) => s.bookerUsername === username),
    [mySlots, username],
  );

  const isSampleData = allSlots.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" richColors />

      {/* ── Utility bar ── */}
      <div
        className="w-full py-2 px-4 flex flex-col items-center gap-2"
        style={{ background: "oklch(var(--tennis-green))" }}
      >
        {/* Nickname row */}
        <div className="flex items-center justify-center gap-3 w-full">
          <label
            htmlFor="nickname-input"
            className="text-white text-sm font-medium shrink-0"
          >
            Enter your nickname to book:
          </label>
          <Input
            id="nickname-input"
            data-ocid="profile.input"
            className="h-8 w-44 text-sm bg-white text-foreground border-none focus-visible:ring-white/50"
            placeholder="Your nickname"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSetNickname()}
          />
          <Button
            data-ocid="profile.primary_button"
            size="sm"
            className="h-8 px-3 text-sm font-semibold bg-white hover:bg-white/90"
            style={{ color: "oklch(var(--tennis-green))" }}
            onClick={handleSetNickname}
          >
            Set Profile
          </Button>
          {/* Comment toggle (shown when username is set) */}
          {username && (
            <button
              type="button"
              data-ocid="profile.toggle"
              onClick={() => setShowCommentEditor((v) => !v)}
              className="ml-1 flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-medium transition-colors"
              title="Edit profile comment"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">
                {profileComment ? "Edit bio" : "Add bio"}
              </span>
            </button>
          )}
        </div>

        {/* Profile comment display (collapsed by default) */}
        {username && profileComment && !showCommentEditor && (
          <p className="text-white/80 text-xs italic max-w-xl text-center">
            &ldquo;{profileComment}&rdquo;
          </p>
        )}

        {/* Profile comment editor */}
        {username && showCommentEditor && (
          <div
            data-ocid="profile.panel"
            className="flex items-start gap-2 w-full max-w-xl"
          >
            <Textarea
              data-ocid="profile.textarea"
              className="flex-1 text-sm min-h-[60px] bg-white text-foreground border-none focus-visible:ring-white/50 resize-none"
              placeholder="Add a short bio or comment about yourself..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              maxLength={200}
            />
            <Button
              data-ocid="profile.save_button"
              size="sm"
              className="h-8 px-3 text-sm font-semibold bg-white hover:bg-white/90 shrink-0"
              style={{ color: "oklch(var(--tennis-green))" }}
              onClick={handleSaveComment}
              disabled={setCommentMutation.isPending}
            >
              {setCommentMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1" />
              )}
              {setCommentMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {/* ── Primary header / nav ── */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🎾</span>
            <span
              className="font-bold text-lg tracking-tight"
              style={{ color: "oklch(var(--tennis-green))" }}
            >
              CourtSync
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 flex items-center gap-1">
            {(["browse", "post", "bookings"] as Tab[]).map((tab) => {
              const labels: Record<Tab, string> = {
                browse: "Browse Slots",
                post: "Post a Slot",
                bookings: "My Bookings",
              };
              const ocids: Record<Tab, string> = {
                browse: "nav.browse.link",
                post: "nav.post.link",
                bookings: "nav.bookings.link",
              };
              return (
                <button
                  key={tab}
                  type="button"
                  data-ocid={ocids[tab]}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative ${
                    activeTab === tab
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {labels[tab]}
                  {activeTab === tab && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                      style={{ background: "oklch(var(--tennis-green))" }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Avatar */}
          {username && (
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 select-none"
              style={{ background: "oklch(var(--tennis-green-dark))" }}
            >
              {getInitial(username)}
            </div>
          )}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 bg-background">
        {/* BROWSE TAB */}
        {activeTab === "browse" && (
          <section
            data-ocid="browse.section"
            className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
          >
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Available Tennis Court Slots
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              {isSampleData
                ? "Showing sample slots — be the first to post a real one!"
                : `${filteredSlots.length} slot${
                    filteredSlots.length !== 1 ? "s" : ""
                  } found`}
            </p>

            {/* Filter row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Location filter */}
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger
                  data-ocid="browse.select"
                  className="w-48 h-9 text-sm bg-card"
                >
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Court type filter */}
              <Select value={courtFilter} onValueChange={setCourtFilter}>
                <SelectTrigger className="w-40 h-9 text-sm bg-card">
                  <SelectValue placeholder="Court Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Court Types</SelectItem>
                  {courtTypes.map((ct) => (
                    <SelectItem key={ct} value={ct}>
                      {ct}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="ml-auto relative">
                <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  data-ocid="browse.search_input"
                  className="pl-8 h-9 w-60 bg-card text-sm"
                  placeholder="Search location, host…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Cards grid */}
            {isLoadingAll ? (
              <div
                data-ocid="browse.loading_state"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
                  <Skeleton key={k} className="h-60 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredSlots.length === 0 ? (
              <div
                data-ocid="browse.empty_state"
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <span className="text-5xl mb-4">🎾</span>
                <p className="text-lg font-semibold text-foreground">
                  No slots found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or{" "}
                  <button
                    type="button"
                    className="underline font-medium"
                    style={{ color: "oklch(var(--tennis-green))" }}
                    onClick={() => setActiveTab("post")}
                  >
                    post one yourself
                  </button>
                  .
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSlots.map((slot, i) => (
                  <SlotCard
                    key={String(slot.id)}
                    slot={slot}
                    currentUsername={username}
                    onBook={handleBook}
                    isBooking={bookingId === slot.id}
                    index={i}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* POST TAB */}
        {activeTab === "post" && (
          <section
            data-ocid="post.section"
            className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
          >
            {!username ? (
              <div
                data-ocid="post.error_state"
                className="max-w-md mx-auto bg-card rounded-xl shadow-card p-8 text-center"
              >
                <span className="text-4xl mb-4 block">🎾</span>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  Set your nickname first
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter a nickname in the green bar at the top to post a slot.
                </p>
              </div>
            ) : (
              <PostSlotForm
                username={username}
                onSuccess={() => setActiveTab("browse")}
              />
            )}
          </section>
        )}

        {/* MY BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <section
            data-ocid="bookings.section"
            className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
          >
            {!username ? (
              <div
                data-ocid="bookings.error_state"
                className="max-w-md mx-auto bg-card rounded-xl shadow-card p-8 text-center"
              >
                <span className="text-4xl mb-4 block">🎾</span>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  Set your nickname first
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter a nickname in the green bar at the top to view your
                  bookings.
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Posted slots */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Slots I&apos;ve Posted
                  </h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    Manage the time slots you have listed for other players.
                  </p>
                  {isLoadingMine ? (
                    <div
                      data-ocid="bookings.posted.loading_state"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                      {["sk1", "sk2", "sk3"].map((k) => (
                        <Skeleton key={k} className="h-60 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : postedSlots.length === 0 ? (
                    <div
                      data-ocid="bookings.posted.empty_state"
                      className="bg-card rounded-xl shadow-card p-8 text-center"
                    >
                      <span className="text-3xl mb-3 block">📋</span>
                      <p className="text-sm text-muted-foreground">
                        You haven&apos;t posted any slots yet.{" "}
                        <button
                          type="button"
                          className="underline font-medium"
                          style={{ color: "oklch(var(--tennis-green))" }}
                          onClick={() => setActiveTab("post")}
                        >
                          Post one now
                        </button>
                        .
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {postedSlots.map((slot, i) => (
                        <SlotCard
                          key={String(slot.id)}
                          slot={slot}
                          currentUsername={username}
                          onEdit={setEditingSlot}
                          onDelete={handleDelete}
                          onCancelAsHost={handleCancelAsHost}
                          isDeleting={deletingId === slot.id}
                          isCancellingAsHost={cancellingHostId === slot.id}
                          showManageButtons
                          index={i}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Booked slots */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Slots I&apos;ve Booked
                  </h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    Your confirmed court time reservations.
                  </p>
                  {isLoadingMine ? (
                    <div
                      data-ocid="bookings.booked.loading_state"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                      {["sk1", "sk2", "sk3"].map((k) => (
                        <Skeleton key={k} className="h-60 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : bookedSlots.length === 0 ? (
                    <div
                      data-ocid="bookings.booked.empty_state"
                      className="bg-card rounded-xl shadow-card p-8 text-center"
                    >
                      <span className="text-3xl mb-3 block">🏆</span>
                      <p className="text-sm text-muted-foreground">
                        You haven&apos;t booked any slots yet.{" "}
                        <button
                          type="button"
                          className="underline font-medium"
                          style={{ color: "oklch(var(--tennis-green))" }}
                          onClick={() => setActiveTab("browse")}
                        >
                          Browse available slots
                        </button>
                        .
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {bookedSlots.map((slot, i) => (
                        <SlotCard
                          key={String(slot.id)}
                          slot={slot}
                          currentUsername={username}
                          onCancel={handleCancel}
                          isCancelling={cancellingId === slot.id}
                          showCancelButton
                          index={i}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🎾</span>
            <span
              className="font-bold text-sm"
              style={{ color: "oklch(var(--tennis-green))" }}
            >
              CourtSync
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="hover:text-foreground transition-colors cursor-pointer">
              About
            </span>
            <span className="hover:text-foreground transition-colors cursor-pointer">
              Terms
            </span>
            <span className="hover:text-foreground transition-colors cursor-pointer">
              Privacy
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              className="underline hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* ── Edit modal ── */}
      {editingSlot && (
        <EditSlotForm
          slot={editingSlot}
          username={username}
          onClose={() => setEditingSlot(null)}
        />
      )}
    </div>
  );
}
