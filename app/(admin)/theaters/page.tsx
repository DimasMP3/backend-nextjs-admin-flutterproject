"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { useCreateTheater, useDeleteTheater, useTheaters } from "@/hooks/useTheaters";

export default function TheatersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Theaters</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage venues and rooms</p>
        </div>
        <AddTheaterForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Theaters</CardTitle>
        </CardHeader>
        <CardContent>
          <TheatersTable />
        </CardContent>
      </Card>
    </div>
  );
}

function AddTheaterForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rooms, setRooms] = useState("");
  const [seats, setSeats] = useState("");
  const create = useCreateTheater();

  if (!open) return <Button variant="primary" onClick={() => setOpen(true)}>Add Theater</Button>;

  const submit = async () => {
    await create.mutateAsync({
      name: name.trim(),
      location: location.trim(),
      rooms: rooms ? Number(rooms) : undefined,
      seats: seats ? Number(seats) : undefined,
    });
    setOpen(false);
    setName("");
    setLocation("");
    setRooms("");
    setSeats("");
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
      <label className="text-sm">
        <span className="mb-1 block">Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="h-9 w-56 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Location</span>
        <input value={location} onChange={(e) => setLocation(e.target.value)} className="h-9 w-40 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Rooms</span>
        <input value={rooms} onChange={(e) => setRooms(e.target.value)} className="h-9 w-24 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Seats</span>
        <input value={seats} onChange={(e) => setSeats(e.target.value)} className="h-9 w-24 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <div className="flex gap-2">
        <Button variant="primary" onClick={submit} disabled={!name.trim() || !location.trim()}>Save</Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

function TheatersTable() {
  const { data, isLoading, isError, error } = useTheaters();
  const del = useDeleteTheater();
  if (isLoading) return <div className="text-sm text-zinc-500">Loading...</div>;
  if (isError) return <div className="text-sm text-red-600">{(error as Error).message}</div>;
  if (!data || data.length === 0) return <EmptyState title="No theaters" description="Add a venue to start scheduling." />;

  return (
    <div className="overflow-x-auto">
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Location</TH>
            <TH>Rooms</TH>
            <TH>Seats</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {data.map((t) => (
            <TR key={t.id}>
              <TD className="font-medium">{t.name}</TD>
              <TD>{t.location}</TD>
              <TD>{t.rooms}</TD>
              <TD>{t.seats}</TD>
              <TD className="text-right">
                <div className="inline-flex gap-2">
                  <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => del.mutate(t.id)}>Delete</Button>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
