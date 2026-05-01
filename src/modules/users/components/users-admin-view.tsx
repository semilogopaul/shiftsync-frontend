'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Power,
  Trash2,
  UserCog,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/common/components/confirm-dialog';
import { ApiError } from '@/lib/api-client';
import {
  usersAdminService,
  type AdminCreateUserInput,
  type AdminUser,
} from '@/modules/users/services/users-admin-service';
import type { UserRole } from '@/common/types/user';

const ROLE_OPTIONS: ReadonlyArray<{ value: UserRole; label: string }> = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'EMPLOYEE', label: 'Staff' },
];

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Staff',
};

interface Filters {
  readonly role: UserRole | 'all';
  readonly search: string;
  readonly active: 'all' | 'active' | 'inactive';
}

const PAGE_SIZE = 25;

const apiErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof ApiError ? err.message : fallback;

const queryParamsFromFilters = (filters: Filters, page: number): Record<string, unknown> => {
  const out: Record<string, unknown> = { page, pageSize: PAGE_SIZE };
  if (filters.role !== 'all') out.role = filters.role;
  if (filters.search.trim().length > 0) out.search = filters.search.trim();
  if (filters.active !== 'all') out.isActive = filters.active === 'active';
  return out;
};

export function UsersAdminView() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<Filters>({
    role: 'all',
    search: '',
    active: 'all',
  });
  const [page, setPage] = useState(1);
  const filtersKey = JSON.stringify(filters);
  // Reset to page 1 whenever filters change (during render to avoid cascading effect).
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (prevFiltersKey !== filtersKey) {
    setPrevFiltersKey(filtersKey);
    setPage(1);
  }

  const [showCreate, setShowCreate] = useState(false);

  const queryKey = useMemo(() => ['admin-users', filtersKey, page] as const, [filtersKey, page]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      usersAdminService.list(
        queryParamsFromFilters(filters, page) as Parameters<typeof usersAdminService.list>[0],
      ),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-users'], exact: false });

  const createMutation = useMutation({
    mutationFn: (input: AdminCreateUserInput) => usersAdminService.create(input),
    onSuccess: () => {
      toast.success('User created');
      setShowCreate(false);
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Failed to create user')),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersAdminService.changeRole(id, role),
    onSuccess: () => {
      toast.success('Role updated');
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Failed to change role')),
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersAdminService.setActive(id, isActive),
    onSuccess: (_data, variables) => {
      toast.success(variables.isActive ? 'User reactivated' : 'User deactivated');
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Failed to update user status')),
  });

  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersAdminService.remove(id),
    onSuccess: () => {
      toast.success('User deleted');
      setPendingDelete(null);
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Failed to delete user')),
  });

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 1;

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <UsersIcon className="text-muted-foreground h-6 w-6" aria-hidden />
            Users
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage admins, managers, and staff. {total} user{total === 1 ? '' : 's'}.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" aria-hidden /> New user
        </Button>
      </header>

      <section className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="users-search" className="text-xs">
            Search
          </Label>
          <Input
            id="users-search"
            placeholder="Email or name"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-64"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Role</Label>
          <Select
            value={filters.role}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, role: value as Filters['role'] }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select
            value={filters.active}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                active: value as Filters['active'],
              }))
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="border-border/60 overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                  No users match those filters.
                </TableCell>
              </TableRow>
            ) : (
              items.map((user) => (
                <UserRowView
                  key={user.id}
                  user={user}
                  onChangeRole={(role) => roleMutation.mutate({ id: user.id, role })}
                  onToggleActive={() =>
                    activeMutation.mutate({
                      id: user.id,
                      isActive: !(user.isActive ?? true),
                    })
                  }
                  onDelete={() => setPendingDelete(user)}
                  busy={
                    roleMutation.isPending || activeMutation.isPending || deleteMutation.isPending
                  }
                />
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <footer className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </footer>

      {showCreate ? (
        <CreateUserDialog
          onClose={() => setShowCreate(false)}
          onSubmit={(input) => createMutation.mutate(input)}
          busy={createMutation.isPending}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete user?"
        description={
          pendingDelete
            ? `Soft-delete ${pendingDelete.firstName} ${pendingDelete.lastName}? They will lose access immediately.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        busy={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      />
    </main>
  );
}

interface UserRowViewProps {
  readonly user: AdminUser;
  readonly onChangeRole: (role: UserRole) => void;
  readonly onToggleActive: () => void;
  readonly onDelete: () => void;
  readonly busy: boolean;
}

function UserRowView({ user, onChangeRole, onToggleActive, onDelete, busy }: UserRowViewProps) {
  const isActive = user.isActive ?? true;
  return (
    <TableRow>
      <TableCell className="font-medium">
        {user.firstName} {user.lastName}
      </TableCell>
      <TableCell className="text-muted-foreground">{user.email}</TableCell>
      <TableCell>
        <Select
          value={user.role}
          onValueChange={(value) => onChangeRole(value as UserRole)}
          disabled={busy}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            isActive
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleActive}
            disabled={busy}
            title={isActive ? 'Deactivate' : 'Reactivate'}
          >
            <Power className="h-4 w-4" aria-hidden />
            <span className="sr-only">{isActive ? 'Deactivate' : 'Reactivate'}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} disabled={busy} title="Delete">
            <Trash2 className="h-4 w-4 text-rose-500" aria-hidden />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface CreateUserDialogProps {
  readonly onClose: () => void;
  readonly onSubmit: (input: AdminCreateUserInput) => void;
  readonly busy: boolean;
}

function CreateUserDialog({ onClose, onSubmit, busy }: CreateUserDialogProps) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'EMPLOYEE' as UserRole,
  });

  const handle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    onSubmit({
      email: form.email.trim(),
      password: form.password,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || undefined,
      role: form.role,
    });
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="bg-background/80 absolute inset-0 backdrop-blur-sm"
      />
      <div className="bg-card border-border/60 absolute left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-6 shadow-2xl">
        <header className="flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <UserCog className="text-muted-foreground h-5 w-5" aria-hidden />
              New user
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Admin-created accounts are pre-verified.
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </header>

        <form onSubmit={handle} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                required
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                required
                maxLength={80}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Initial password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
              minLength={8}
            />
            <p className="text-muted-foreground text-xs">
              Share securely. The user can rotate it after first login.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                maxLength={32}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) => setForm((prev) => ({ ...prev, role: value as UserRole }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                {ROLE_LABEL[form.role]} access takes effect immediately.
              </p>
            </div>
          </div>

          <footer className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Creating…
                </>
              ) : (
                'Create user'
              )}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
