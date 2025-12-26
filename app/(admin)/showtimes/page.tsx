"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { useCreateShowtime, useDeleteShowtime, useShowtimes } from "@/hooks/useShowtimes";
import { useMovies } from "@/hooks/useMovies";
import { useTheaters } from "@/hooks/useTheaters";

/**
 * Admin view for managing showtimes.
 */
export default function ShowtimesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Showtimes</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage screening schedules</p>
        </div>
        <CreateShowtimeForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          <ShowtimesTable />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Inline form for creating a quick showtime entry.
 */
function CreateShowtimeForm() {
  const [open, setOpen] = useState(false);
  const [movieId, setMovieId] = useState("");
  const [theaterId, setTheaterId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [lang, setLang] = useState("ID");
  const [type, setType] = useState("2D");
  const create = useCreateShowtime();
  const movies = useMovies();
  const theaters = useTheaters();
  const movieOptions = useMemo(
    () => (movies.data ?? []).map((m) => ({ id: m.id, label: m.title })),
    [movies.data]
  );
  const theaterOptions = useMemo(
    () => (theaters.data ?? []).map((t) => ({ id: t.id, label: `${t.name} (${t.location})` })),
    [theaters.data]
  );

  if (!open) return <Button variant="primary" onClick={() => setOpen(true)}>Create Showtime</Button>;

  const submit = async () => {
    // Convert datetime-local format to ISO string
    const isoDate = startsAt ? new Date(startsAt).toISOString() : '';
    await create.mutateAsync({
      movieId: Number(movieId),
      theaterId: Number(theaterId),
      startsAt: isoDate,
      lang,
      type,
    });
    setOpen(false);
    setMovieId("");
    setTheaterId("");
    setStartsAt("");
    setLang("ID");
    setType("2D");
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
      <label className="text-sm">
        <span className="mb-1 block">Movie</span>
        <select
          value={movieId}
          onChange={(e) => setMovieId(e.target.value)}
          className="h-9 w-56 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <option value="" disabled>
            {movies.isLoading ? "Loading..." : "Select movie"}
          </option>
          {movieOptions.map((m) => (
            <option key={m.id} value={String(m.id)}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Theater</span>
        <select
          value={theaterId}
          onChange={(e) => setTheaterId(e.target.value)}
          className="h-9 w-56 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <option value="" disabled>
            {theaters.isLoading ? "Loading..." : "Select theater"}
          </option>
          {theaterOptions.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Starts At</span>
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className="h-9 w-56 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Lang</span>
        <input value={lang} onChange={(e) => setLang(e.target.value)} className="h-9 w-20 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Type</span>
        <input value={type} onChange={(e) => setType(e.target.value)} className="h-9 w-20 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <div className="flex gap-2">
        <Button variant="primary" onClick={submit} disabled={!movieId || !theaterId || !startsAt}>Save</Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

/**
 * Table wrapper that renders showtimes plus a delete action.
 */
function ShowtimesTable() {
  const { data, isLoading, isError, error } = useShowtimes();
  const del = useDeleteShowtime();
  if (isLoading) return <div className="text-sm text-zinc-500">Loading...</div>;
  if (isError) return <div className="text-sm text-red-600">{(error as Error).message}</div>;
  if (!data || data.length === 0) return <EmptyState title="No showtimes" description="Create your first schedule." />;

  return (
    <div className="overflow-x-auto">
      <Table>
        <THead>
          <TR>
            <TH>Movie ID</TH>
            <TH>Theater ID</TH>
            <TH>Starts</TH>
            <TH>Lang</TH>
            <TH>Type</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {data.map((s) => (
            <TR key={s.id}>
              <TD className="font-medium">{s.movieId}</TD>
              <TD>{s.theaterId}</TD>
              <TD>{new Date(s.startsAt).toLocaleString()}</TD>
              <TD>{s.lang}</TD>
              <TD>{s.type}</TD>
              <TD>
                <Badge variant={s.status === "scheduled" ? "success" : s.status === "canceled" ? "error" : "default"}>{s.status}</Badge>
              </TD>
              <TD className="text-right">
                <div className="inline-flex gap-2">
                  <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => del.mutate(s.id)}>Delete</Button>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

