import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TimeSlot {
    id: bigint;
    status: string;
    date: string;
    time: string;
    hostUsername: string;
    durationMinutes: bigint;
    notes?: string;
    location: string;
    bookerUsername?: string;
    courtType: string;
}
export interface backendInterface {
    bookSlot(slotId: bigint, bookerUsername: string): Promise<void>;
    cancelBooking(slotId: bigint, bookerUsername: string): Promise<void>;
    createTimeSlot(slot: TimeSlot): Promise<bigint>;
    deleteTimeSlot(slotId: bigint, hostUsername: string): Promise<void>;
    editTimeSlot(slotId: bigint, hostUsername: string, updatedSlot: TimeSlot): Promise<void>;
    getAllTimeSlots(): Promise<Array<TimeSlot>>;
    getSlotsByUsername(username: string): Promise<Array<TimeSlot>>;
    setProfileComment(username: string, comment: string): Promise<void>;
    getProfileComment(username: string): Promise<string | undefined>;
}
