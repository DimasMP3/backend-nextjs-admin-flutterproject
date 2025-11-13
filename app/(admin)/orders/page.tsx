"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { useCreateOrder, useDeleteOrder, useOrders } from "@/hooks/useOrders";
import { useState } from "react";

export default function OrdersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Orders</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Recent purchases and status</p>
        </div>
        <CreateOrderForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable />
        </CardContent>
      </Card>
    </div>
  );
}

function CreateOrderForm() {
  const [open, setOpen] = useState(false);
  const [showtimeId, setShowtimeId] = useState("");
  const [customer, setCustomer] = useState("");
  const [seats, setSeats] = useState("");
  const [total, setTotal] = useState("");
  const create = useCreateOrder();
  if (!open) return <Button onClick={() => setOpen(true)}>Add Order</Button>;

  const submit = async () => {
    await create.mutateAsync({
      showtimeId: Number(showtimeId),
      customer: customer.trim(),
      seats: Number(seats),
      total: Number(total),
    });
    setOpen(false);
    setShowtimeId("");
    setCustomer("");
    setSeats("");
    setTotal("");
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
      <label className="text-sm">
        <span className="mb-1 block">Showtime ID</span>
        <input value={showtimeId} onChange={(e) => setShowtimeId(e.target.value)} className="h-9 w-28 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Customer</span>
        <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="h-9 w-48 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Seats</span>
        <input value={seats} onChange={(e) => setSeats(e.target.value)} className="h-9 w-24 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Total</span>
        <input value={total} onChange={(e) => setTotal(e.target.value)} className="h-9 w-32 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <div className="flex gap-2">
        <Button variant="primary" onClick={submit} disabled={!showtimeId || !customer || !seats || !total}>Save</Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

function OrdersTable() {
  const { data, isLoading, isError, error } = useOrders();
  const del = useDeleteOrder();
  if (isLoading) return <div className="text-sm text-zinc-500">Loading...</div>;
  if (isError) return <div className="text-sm text-red-600">{(error as Error).message}</div>;
  if (!data || data.length === 0) return <EmptyState title="No orders" description="Orders will appear here." />;
  return (
    <div className="overflow-x-auto">
      <Table>
        <THead>
          <TR>
            <TH>ID</TH>
            <TH>Customer</TH>
            <TH>Showtime</TH>
            <TH>Seats</TH>
            <TH>Total</TH>
            <TH>Status</TH>
            <TH>Created</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {data.map((o) => (
            <TR key={o.id}>
              <TD className="font-medium">{o.id}</TD>
              <TD>{o.customer}</TD>
              <TD>{o.showtimeId}</TD>
              <TD>{o.seats}</TD>
              <TD>Rp {o.total.toLocaleString("id-ID")}</TD>
              <TD>
                <Badge variant={o.status === "paid" ? "success" : o.status === "pending" ? "warning" : "default"}>{o.status}</Badge>
              </TD>
              <TD>{new Date(o.createdAt).toLocaleString()}</TD>
              <TD className="text-right">
                <div className="inline-flex gap-2">
                  <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => del.mutate(o.id)}>Delete</Button>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
