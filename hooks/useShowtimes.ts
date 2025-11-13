"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createShowtime, deleteShowtime, fetchShowtimes, showtimesKeys } from "@/lib/api/showtimes";

export function useShowtimes(params?: { movieId?: number }) {

  return useQuery({ queryKey: showtimesKeys.lists(), queryFn: () => fetchShowtimes(params) });

}

export function useCreateShowtime() {

  const qc = useQueryClient();

  return useMutation({
    mutationFn: createShowtime,
    onSuccess: () => qc.invalidateQueries({ queryKey: showtimesKeys.lists() }),
  });

}

export function useDeleteShowtime() {

  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteShowtime,
    onSuccess: () => qc.invalidateQueries({ queryKey: showtimesKeys.lists() }),
  });

}
