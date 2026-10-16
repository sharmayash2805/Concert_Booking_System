import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingsApi, eventsApi, type EventRequest } from "@/lib/api";

export const queryKeys = {
  events: ["events"] as const,
  event: (id: number) => ["events", id] as const,
  myBookings: ["bookings", "me"] as const,
};

export const useEvents = () => useQuery({ queryKey: queryKeys.events, queryFn: eventsApi.list });

export const useEvent = (id: number) => useQuery({
  queryKey: queryKeys.event(id),
  queryFn: () => eventsApi.get(id),
  enabled: Number.isInteger(id) && id > 0,
});

export const useMyBookings = () => useQuery({
  queryKey: queryKeys.myBookings,
  queryFn: bookingsApi.mine,
});

export const useHoldTickets = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ zoneId, ticketCount }: { zoneId: number; ticketCount: number }) =>
      bookingsApi.hold(zoneId, ticketCount),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.events });
      void queryClient.invalidateQueries({ queryKey: queryKeys.myBookings });
    },
  });
};

export const useUpdateHoldQuantity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, quantity }: { bookingId: number; quantity: number }) =>
      bookingsApi.updateQuantity(bookingId, quantity),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.events });
      void queryClient.invalidateQueries({ queryKey: queryKeys.myBookings });
    },
  });
};

export const useConfirmBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.confirm,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.myBookings });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.events });
      void queryClient.invalidateQueries({ queryKey: queryKeys.myBookings });
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.events }),
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, event }: { id: number; event: EventRequest }) => eventsApi.update(id, event),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.events }),
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.remove,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.events }),
  });
};