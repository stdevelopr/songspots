import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '@common';
import type { UserInfo, Vibe } from '@backend/backend.did';

function useAdminData() {
  const { actor, isFetching } = useActor();

  const isAdminQ = useQuery({
    queryKey: ['admin:isCurrentUserAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCurrentUserAdmin();
    },
    enabled: !!actor && !isFetching,
  });

  const usersQ = useQuery<UserInfo[]>({
    queryKey: ['admin:listUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUsers();
    },
    enabled: !!actor && !isFetching && !!isAdminQ.data,
  });

  const vibesQ = useQuery<Vibe[]>({
    queryKey: ['admin:getAllVibes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVibes();
    },
    enabled: !!actor && !isFetching && !!isAdminQ.data,
  });

  return { isAdminQ, usersQ, vibesQ };
}

const StatPill: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
  <div className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 shadow-sm">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
);

const AdminPage: React.FC = () => {
  const { isAdminQ, usersQ, vibesQ } = useAdminData();

  if (isAdminQ.isLoading) {
    return <div className="p-6">Checking permissions…</div>;
  }

  if (!isAdminQ.data) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Admin</h1>
        <p className="text-gray-700">You do not have permission to view this page.</p>
      </div>
    );
  }

  const users = usersQ.data || [];
  const vibes = vibesQ.data || [];

  // User stats
  const totalUsers = users.length;
  const byApproval = users.reduce(
    (acc, u) => {
      const k = Object.keys(u.approval)[0] as 'pending' | 'approved' | 'rejected';
      acc[k] += 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 }
  );
  const byRole = users.reduce(
    (acc, u) => {
      const k = Object.keys(u.role)[0] as 'admin' | 'user' | 'guest';
      acc[k] += 1;
      return acc;
    },
    { admin: 0, user: 0, guest: 0 }
  );

  // Pin stats
  const totalVibes = vibes.length;
  const publicVibes = vibes.filter((v) => !v.isPrivate).length;
  const privateVibes = totalVibes - publicVibes;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-md bg-white border border-gray-200 shadow-sm text-sm cursor-pointer hover:bg-gray-50"
            onClick={() => {
              usersQ.refetch();
              vibesQ.refetch();
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Users</h2>
          <div className="flex flex-wrap gap-3">
            <StatPill label="Total" value={totalUsers} />
            <StatPill label="Approved" value={byApproval.approved} />
            <StatPill label="Pending" value={byApproval.pending} />
            <StatPill label="Rejected" value={byApproval.rejected} />
            <StatPill label="Admins" value={byRole.admin} />
            <StatPill label="Users" value={byRole.user} />
            <StatPill label="Guests" value={byRole.guest} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Vibes</h2>
          <div className="flex flex-wrap gap-3">
            <StatPill label="Total" value={totalVibes} />
            <StatPill label="Public" value={publicVibes} />
            <StatPill label="Private" value={privateVibes} />
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold mb-3">Recent Users</h3>
          <div className="divide-y divide-gray-100">
            {users.slice(0, 10).map((u) => (
              <div key={u.principal.toString()} className="py-2 text-sm flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="font-mono text-gray-700">{u.principal.toString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-xs">
                    {Object.keys(u.role)[0]}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-xs">
                    {Object.keys(u.approval)[0]}
                  </span>
                </div>
              </div>
            ))}
            {users.length === 0 && <div className="text-sm text-gray-500 py-2">No users</div>}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold mb-3">Recent Vibes</h3>
          <div className="divide-y divide-gray-100">
            {vibes.slice(-10).reverse().map((v) => (
              <div key={v.id.toString()} className="py-2 text-sm flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="font-medium text-gray-800">{v.name || 'Untitled'}</span>
                  {v.description && (
                    <span className="ml-2 text-gray-500 truncate inline-block max-w-[280px] align-middle">{v.description}</span>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs border ${v.isPrivate ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                  {v.isPrivate ? 'Private' : 'Public'}
                </span>
              </div>
            ))}
            {vibes.length === 0 && <div className="text-sm text-gray-500 py-2">No vibes</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
