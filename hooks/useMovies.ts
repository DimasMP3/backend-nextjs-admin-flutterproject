"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMovie, deleteMovie, fetchMovies, moviesKeys, updateMovie } from "@/lib/api/movies";

export function useMovies() {

  return useQuery({ queryKey: moviesKeys.lists(), queryFn: fetchMovies });

}

export function useCreateMovie() {

  const qc = useQueryClient();

  return useMutation({
    mutationFn: createMovie,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: moviesKeys.lists() });
    },
  });

}

export function useUpdateMovie() {

  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateMovie>[1] }) => updateMovie(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: moviesKeys.lists() });
      qc.invalidateQueries({ queryKey: moviesKeys.detail(id) });
    },
  });

}

export function useDeleteMovie() {

  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteMovie,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: moviesKeys.lists() });
    },
  });

}
