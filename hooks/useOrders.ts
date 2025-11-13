"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder, deleteOrder, fetchOrders, ordersKeys } from "@/lib/api/orders";

export function useOrders() {

  return useQuery({ queryKey: ordersKeys.lists(), queryFn: () => fetchOrders() });

}

export function useCreateOrder() {

  const qc = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ordersKeys.lists() }),
  });

}

export function useDeleteOrder() {

  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ordersKeys.lists() }),
  });

}
