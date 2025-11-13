"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { useCreateUser, useDeleteUser, useUsers } from "@/hooks/useUsers";

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage access and roles</p>
        </div>
        <InviteForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable />
        </CardContent>
      </Card>
    </div>
  );
}

function InviteForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const create = useCreateUser();
  if (!open) return <Button variant="primary" onClick={() => setOpen(true)}>Invite User</Button>;

  const submit = async () => {
    await create.mutateAsync({ name: name || undefined, email, role });
    setOpen(false);
    setName("");
    setEmail("");
    setRole("staff");
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
      <label className="text-sm">
        <span className="mb-1 block">Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="h-9 w-48 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Email</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 w-56 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Role</span>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="h-9 w-40 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <option value="admin">admin</option>
          <option value="staff">staff</option>
          <option value="customer">customer</option>
        </select>
      </label>
      <div className="flex gap-2">
        <Button variant="primary" onClick={submit} disabled={!email}>Invite</Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

function UsersTable() {
  const { data, isLoading, isError, error } = useUsers();
  const del = useDeleteUser();
  if (isLoading) return <div className="text-sm text-zinc-500">Loading...</div>;
  if (isError) return <div className="text-sm text-red-600">{(error as Error).message}</div>;
  if (!data || data.length === 0) return <EmptyState title="No users" description="Invite staff to collaborate." />;

  return (
    <div className="overflow-x-auto">
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Email</TH>
            <TH>Role</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {data.map((u) => (
            <TR key={u.id}>
              <TD className="font-medium">{u.name ?? "-"}</TD>
              <TD className="text-zinc-500 dark:text-zinc-400">{u.email}</TD>
              <TD>
                <Badge>{u.role}</Badge>
              </TD>
              <TD>
                <Badge variant={u.status === "active" ? "success" : "warning"}>{u.status}</Badge>
              </TD>
              <TD className="text-right">
                <div className="inline-flex gap-2">
                  <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => del.mutate(u.id)}>Delete</Button>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
