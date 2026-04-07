import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TimeSlot } from "../backend";
import { useActor } from "./useActor";

export function useGetAllTimeSlots() {
  const { actor, isFetching } = useActor();
  return useQuery<TimeSlot[]>({
    queryKey: ["timeSlots"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTimeSlots();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSlotsByUsername(username: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TimeSlot[]>({
    queryKey: ["slotsByUsername", username],
    queryFn: async () => {
      if (!actor || !username) return [];
      return actor.getSlotsByUsername(username);
    },
    enabled: !!actor && !isFetching && !!username,
  });
}

export function useCreateTimeSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slot: TimeSlot) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createTimeSlot(slot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      queryClient.invalidateQueries({ queryKey: ["slotsByUsername"] });
    },
  });
}

export function useBookSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slotId,
      bookerUsername,
    }: { slotId: bigint; bookerUsername: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.bookSlot(slotId, bookerUsername);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      queryClient.invalidateQueries({ queryKey: ["slotsByUsername"] });
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slotId,
      bookerUsername,
    }: { slotId: bigint; bookerUsername: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.cancelBooking(slotId, bookerUsername);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      queryClient.invalidateQueries({ queryKey: ["slotsByUsername"] });
    },
  });
}

export function useCancelSlotAsHost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slotId,
      hostUsername,
    }: { slotId: bigint; hostUsername: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.cancelSlotAsHost(slotId, hostUsername);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      queryClient.invalidateQueries({ queryKey: ["slotsByUsername"] });
    },
  });
}

export function useDeleteTimeSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slotId,
      hostUsername,
    }: { slotId: bigint; hostUsername: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTimeSlot(slotId, hostUsername);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      queryClient.invalidateQueries({ queryKey: ["slotsByUsername"] });
    },
  });
}

export function useEditTimeSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slotId,
      hostUsername,
      updatedSlot,
    }: {
      slotId: bigint;
      hostUsername: string;
      updatedSlot: TimeSlot;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.editTimeSlot(slotId, hostUsername, updatedSlot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      queryClient.invalidateQueries({ queryKey: ["slotsByUsername"] });
    },
  });
}

export function useGetProfileComment(username: string) {
  const { actor, isFetching } = useActor();
  return useQuery<string | undefined>({
    queryKey: ["profileComment", username],
    queryFn: async () => {
      if (!actor || !username) return undefined;
      return actor.getProfileComment(username);
    },
    enabled: !!actor && !isFetching && !!username,
  });
}

export function useSetProfileComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      comment,
    }: { username: string; comment: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setProfileComment(username, comment);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["profileComment", variables.username],
      });
    },
  });
}
