"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { useCreateMovie, useDeleteMovie, useMovies, useUpdateMovie } from "@/hooks/useMovies";

export default function MoviesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Movies</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage movie catalog and metadata</p>
        </div>
        <AddMovieForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Movies</CardTitle>
        </CardHeader>
        <CardContent>
          <MoviesTable />
        </CardContent>
      </Card>
    </div>
  );
}

function AddMovieForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState<"now_showing" | "coming_soon" | "archived">("coming_soon");
  const [file, setFile] = useState<File | null>(null);
  const create = useCreateMovie();

  const submit = async () => {
    let posterAssetId: number | undefined = undefined;
    if (file) {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/assets", { method: "POST", body: fd });
      if (res.ok) {
        const j = await res.json();
        posterAssetId = j.data?.id ?? j.id;
      }
    }
    await create.mutateAsync({
      title: title.trim(),
      genre: genre || undefined,
      durationMin: duration ? Number(duration) : undefined,
      rating: rating || undefined,
      status,
      posterAssetId,
    });
    setOpen(false);
    setTitle("");
    setGenre("");
    setDuration("");
    setRating("");
    setStatus("coming_soon");
    setFile(null);
  };

  if (!open) {
    return (
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setOpen(true)}>Add Movie</Button>
      </div>
    );
  }
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
      <label className="text-sm">
        <span className="mb-1 block">Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 w-56 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Genre</span>
        <input value={genre} onChange={(e) => setGenre(e.target.value)} className="h-9 w-40 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Duration</span>
        <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="min" className="h-9 w-28 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Rating</span>
        <input value={rating} onChange={(e) => setRating(e.target.value)} className="h-9 w-28 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Status</span>
        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value as "now_showing" | "coming_soon" | "archived"
            )
          }
          className="h-9 w-40 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <option value="now_showing">now_showing</option>
          <option value="coming_soon">coming_soon</option>
          <option value="archived">archived</option>
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Poster</span>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="h-9 w-56 text-sm" />
      </label>
      <div className="flex gap-2">
        <Button variant="primary" onClick={submit} disabled={create.isPending || !title.trim()}>Save</Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

function MoviesTable() {
  const { data, isLoading, isError, error } = useMovies();
  const update = useUpdateMovie();
  const del = useDeleteMovie();
  const [editing, setEditing] = React.useState<number | null>(null);

  if (isLoading) return <div className="text-sm text-zinc-500">Loading…</div>;
  if (isError) return <div className="text-sm text-red-600">{(error as Error).message}</div>;
  if (!data || data.length === 0) return <EmptyState title="No movies yet" description="Start by adding your first movie." />;

  return (
    <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Poster</TH>
                    <TH>Title</TH>
                    <TH>Genre</TH>
                    <TH>Duration</TH>
                    <TH>Rating</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
          {data.map((m) => (
            <TR key={m.id}>
              <TD>
                {m.posterAssetId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/assets/${m.posterAssetId}`}
                    alt="poster"
                    className="h-10 w-7 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-7 rounded bg-zinc-200 dark:bg-zinc-800" />
                )}
              </TD>
              {editing === m.id ? (
                <EditableCells row={m} onCancel={() => setEditing(null)} onSave={async (payload) => {
                  await update.mutateAsync({ id: m.id, data: payload });
                  setEditing(null);
                }} />
              ) : (
                <ReadOnlyCells row={m} onEdit={() => setEditing(m.id)} onDelete={() => del.mutate(m.id)} />
              )}
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

type MovieRow = NonNullable<ReturnType<typeof useMovies>["data"]>[number];

function ReadOnlyCells({ row, onEdit, onDelete }: { row: MovieRow; onEdit: () => void; onDelete: () => void }) {
  return (
    <>
      <TD className="font-medium">{row.title}</TD>
      <TD>{row.genre ?? "-"}</TD>
      <TD>{row.durationMin ?? "-"} {row.durationMin ? "min" : ""}</TD>
      <TD>{row.rating ?? "-"}</TD>
      <TD>
        <Badge variant={row.status === "now_showing" ? "success" : row.status === "coming_soon" ? "warning" : "default"}>{row.status}</Badge>
      </TD>
      <TD className="text-right">
        <div className="inline-flex gap-2">
          <Button size="sm" className="h-8 px-2" onClick={onEdit}>Edit</Button>
          <Button size="sm" variant="destructive" className="h-8 px-2" onClick={onDelete}>Delete</Button>
        </div>
      </TD>
    </>
  );
}

function EditableCells({ row, onCancel, onSave }: { row: MovieRow; onCancel: () => void; onSave: (data: Partial<Omit<MovieRow, "id" | "createdAt">>) => Promise<void> }) {
  const [title, setTitle] = React.useState(row.title);
  const [genre, setGenre] = React.useState(row.genre ?? "");
  const [duration, setDuration] = React.useState(row.durationMin?.toString() ?? "");
  const [rating, setRating] = React.useState(row.rating ?? "");
  const [status, setStatus] = React.useState(row.status as "now_showing" | "coming_soon" | "archived");
  return (
    <>
      <TD className="font-medium">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 w-48 rounded border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
      </TD>
      <TD>
        <input value={genre} onChange={(e) => setGenre(e.target.value)} className="h-8 w-36 rounded border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
      </TD>
      <TD>
        <input value={duration} onChange={(e) => setDuration(e.target.value)} className="h-8 w-24 rounded border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
      </TD>
      <TD>
        <input value={rating} onChange={(e) => setRating(e.target.value)} className="h-8 w-24 rounded border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
      </TD>
      <TD>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "now_showing" | "coming_soon" | "archived")}
          className="h-8 w-40 rounded border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="now_showing">now_showing</option>
          <option value="coming_soon">coming_soon</option>
          <option value="archived">archived</option>
        </select>
      </TD>
      <TD className="text-right">
        <div className="inline-flex gap-2">
          <Button size="sm" className="h-8 px-2" onClick={() => onSave({
            title: title.trim(),
            genre: genre || undefined,
            durationMin: duration ? Number(duration) : undefined,
            rating: rating || undefined,
            status,
          })}>Save</Button>
          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={onCancel}>Cancel</Button>
        </div>
      </TD>
    </>
  );
}
