"use client";

import { useState, useEffect } from "react";
import ContentContainer from "@/components/ContentContainer";
import { User, Bell, Link2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Profile form
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [position, setPosition] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("profile");
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setProfile(p);
        setName(p.name || "");
        setRank(p.rank || "");
        setPosition(p.position || "");
      } catch {}
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res: any = await fetchApi("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ name, rank, position }),
      });
      const updated = { ...profile, ...res?.data };
      setProfile(updated);
      localStorage.setItem("profile", JSON.stringify(updated));
      setMessage("บันทึกข้อมูลสำเร็จ");
    } catch {
      setMessage("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <ContentContainer titlePage="การตั้งค่า">
      <div className="flex flex-col gap-6 max-w-3xl">
        {/* Success message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm font-medium ${message.includes("สำเร็จ") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message}
          </div>
        )}

        {/* Profile settings */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><User className="w-5 h-5" /> ข้อมูลส่วนตัว</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
              <input
                type="email"
                disabled
                value={profile?.email || ""}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ยศ</label>
                <input
                  type="text"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="เช่น พ.อ., น.อ."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="เช่น ผอ.กอง"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </form>
        </div>

        {/* Notification settings */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Bell className="w-5 h-5" /> การแจ้งเตือน</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-800">เปิดการแจ้งเตือน</p>
                <p className="text-xs text-gray-500">รับการแจ้งเตือนภารกิจและอัปเดต</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Link2 className="w-5 h-5" /> การเชื่อมต่อ</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="text-sm font-medium text-gray-800">LINE Notify</p>
                <p className="text-xs text-gray-500">เชื่อมต่อกับ LINE เพื่อรับการแจ้งเตือน</p>
              </div>
              <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition">
                เชื่อมต่อ LINE
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-800">Google Calendar</p>
                <p className="text-xs text-gray-500">ซิงค์ภารกิจกับ Google Calendar</p>
              </div>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition">
                เชื่อมต่อ Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
}
