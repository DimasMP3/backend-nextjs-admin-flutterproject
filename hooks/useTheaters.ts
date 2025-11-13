"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTheater, deleteTheater, fetchTheaters, theatersKeys } from "@/lib/api/theaters";

export function useTheaters() {
  return useQuery({ queryKey: theatersKeys.lists(), queryFn: () => fetchTheaters() });
}

export function useCreateTheater() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTheater,
    onSuccess: () => qc.invalidateQueries({ queryKey: theatersKeys.lists() }),
  });
}

export function useDeleteTheater() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTheater,
    onSuccess: () => qc.invalidateQueries({ queryKey: theatersKeys.lists() }),
  });
}

