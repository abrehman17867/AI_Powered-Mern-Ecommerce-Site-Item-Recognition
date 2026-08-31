"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../config/apiConfig";
import AdminPageHeader from "./ui/AdminPageHeader";
import AdminCard from "./ui/AdminCard";
import TableWrapper from "../../components/ui/TableWrapper";
import { adminToast } from "../../utils/adminToast";

const CustomersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/api/users");
        setUsers(response.data);
      } catch (err) {
        adminToast.error(err?.message || "Could not load customers.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (user) =>
        String(user.firstName || "").toLowerCase().includes(q) ||
        String(user.lastName || "").toLowerCase().includes(q) ||
        String(user.email || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Customers"
        subtitle="Browse registered shoppers and account metadata."
      />
      <AdminCard noPadding>
        <div className="border-b border-line/60 px-5 py-4 sm:px-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers…"
            className="ui-input sm:max-w-xs"
          />
        </div>
        {loading ? (
          <div className="py-12 text-center text-sm text-foreground-muted">Loading customers…</div>
        ) : (
          <TableWrapper className="border-0 shadow-none rounded-none">
            <table className="min-w-full text-sm">
              <thead className="admin-table-head">
                <tr>
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Mobile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {filteredUsers.map((user, index) => (
                  <tr key={user._id} className="transition hover:bg-surface-muted/60">
                    <td className="px-3 py-3 text-zinc-600">{index + 1}</td>
                    <td className="px-3 py-3 font-medium text-zinc-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-3 py-3 text-zinc-700">{user.email}</td>
                    <td className="px-3 py-3 text-zinc-600">{user.role}</td>
                    <td className="px-3 py-3 text-zinc-600">{user.mobile || "—"}</td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-sm text-zinc-500">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableWrapper>
        )}
      </AdminCard>
    </div>
  );
};
export default CustomersTable;