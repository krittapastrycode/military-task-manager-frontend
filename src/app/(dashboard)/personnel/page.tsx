"use client";

import { useState, useEffect, useCallback } from "react";
import ContentContainer from "@/components/ContentContainer";
import { Search, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { IAdmin, IPagination } from "@/types";

export default function PersonnelPage() {
  const [admins, setAdmins] = useState<IAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<IPagination>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const fetchAdmins = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(pagination.per_page),
      });
      if (search) params.set("search", search);

      const res: any = await fetchApi(`/api/admin?${params}`);
      setAdmins((res?.data ?? []).map((a: any) => ({
        ...a,
        role: Array.isArray(a.role) ? a.role : a.role ? [a.role] : [],
      })));
      if (res?.meta) {
        setPagination({
          current_page: res.meta.current_page,
          last_page: res.meta.last_page,
          per_page: res.meta.per_page,
          total: res.meta.total,
        });
      }
    } catch {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.per_page, search]);

  useEffect(() => {
    fetchAdmins(1);
  }, [fetchAdmins]);

  const pages = Array.from({ length: pagination.last_page }, (_, i) => i + 1);

  return (
    <ContentContainer titlePage="กำลังพล">
      <div className="flex flex-col gap-4">
        {/* Search bar */}
        <div className="flex gap-3 items-center">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 font-semibold">
              <tr>
                <th className="px-3 py-2 border-r w-10 text-center">#</th>
                <th className="px-3 py-2 border-r w-[25%]">ชื่อ</th>
                <th className="px-3 py-2 border-r w-[25%]">อีเมล</th>
                <th className="px-3 py-2 border-r w-[100px] text-center">ยศ</th>
                <th className="px-3 py-2 border-r w-[140px] text-center">ตำแหน่ง</th>
                <th className="px-3 py-2 w-[120px] text-center">บทบาท</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
                    </div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">ไม่พบข้อมูลกำลังพล</td>
                </tr>
              ) : (
                admins.map((admin, idx) => {
                  const rowNum = pagination.per_page * (pagination.current_page - 1) + (idx + 1);
                  return (
                    <tr key={admin.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 border-r text-gray-500 text-center">{rowNum}</td>
                      <td className="px-3 py-3 border-r font-medium text-gray-900">{admin.name}</td>
                      <td className="px-3 py-3 border-r text-gray-600">{admin.email}</td>
                      <td className="px-3 py-3 border-r text-gray-600">{admin.rank || "-"}</td>
                      <td className="px-3 py-3 border-r text-gray-600">{admin.position || "-"}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {admin.role?.map((r) => (
                            <span key={r} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">
                              {r}
                            </span>
                          )) || <span className="text-gray-400 text-xs">-</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-1">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => fetchAdmins(pagination.current_page - 1)}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              ←
            </button>
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => fetchAdmins(p)}
                className={`px-3 py-1.5 text-sm border rounded-lg transition ${
                  p === pagination.current_page
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchAdmins(pagination.current_page + 1)}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              →
            </button>
          </div>
        )}
      </div>
    </ContentContainer>
  );
}
