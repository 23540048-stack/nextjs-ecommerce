"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  Plus,
  Flame,
  Loader2,
} from "lucide-react";

interface DashboardData {
  totalRevenue: number;
  activeMissions: number;
  totalGear: number;
  registeredShinobi: number;
  recentMissions: {
    id: string;
    ninja: string;
    status: string;
  }[];
  lowStockItems: {
    name: string;
    stock: number;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 🟢 Lấy token an toàn từ Storage/Cookie
        const adminToken =
          localStorage.getItem("admin_access_token") ||
          localStorage.getItem("access_token") ||
          localStorage.getItem("token");

        // Gọi API tổng hợp thông tin Dashboard từ NestJS Backend
        const res = await api.get("/admin/dashboard/stats", {
          headers: adminToken
            ? { Authorization: `Bearer ${adminToken}` }
            : undefined,
        });

        const responseData = res.data?.data || res.data;
        setData(responseData);
      } catch (err: any) {
        console.error("Failed to load dashboard stats:", err);
        setError("FAILED TO FETCH HOKAGE COMMAND DATA");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-ivory p-6 flex flex-col items-center justify-center font-mono">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
        <span className="font-bold text-sm tracking-widest text-brand-dark uppercase">
          COMMUNING WITH HOKAGE SCROLLS...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-brand-ivory p-6 flex flex-col items-center justify-center font-mono">
        <div className="bg-white border-2 border-brand-dark p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
          <h2 className="font-bold text-lg text-brand-dark">
            {error || "NO DATA AVAILABLE"}
          </h2>
          <Button variant="outline" onClick={() => window.location.reload()}>
            RETRY CONNECTION
          </Button>
        </div>
      </div>
    );
  }

  const STATS = [
    {
      title: "TOTAL REVENUE (CHAKRA)",
      value: `$${new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(data.totalRevenue || 0)}`,
      icon: TrendingUp,
    },
    {
      title: "ACTIVE MISSIONS (ORDERS)",
      value: String(data.activeMissions || 0),
      icon: ShoppingCart,
    },
    {
      title: "TOTAL GEAR (PRODUCTS)",
      value: String(data.totalGear || 0),
      icon: Package,
    },
    {
      title: "REGISTERED SHINOBI",
      value: String(data.registeredShinobi || 0),
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8 p-6 font-mono bg-brand-ivory min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-brand-dark/15">
        <div>
          <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 tracking-widest uppercase">
            LIVE OVERVIEW
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-wider text-brand-dark mt-1 uppercase">
            HOKAGE COMMAND CENTER
          </h1>
        </div>
        <Link href="/admin/products/new">
          <Button variant="chakra" size="sm" icon={Plus}>
            NEW GEAR SCROLL
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white border-2 border-brand-dark p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <span className="text-[10px] font-bold tracking-widest text-brand-dark/50 uppercase">
                {stat.title}
              </span>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-heading text-xl sm:text-2xl tracking-wider text-brand-dark">
                  {stat.value}
                </span>
                <div className="p-2 bg-orange-500/10 border border-orange-500/30 text-orange-600">
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 bg-white border-2 border-brand-dark p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Flame size={18} className="text-orange-600" />
            <h2 className="font-heading text-lg tracking-wider uppercase text-brand-dark">
              RECENT MISSIONS
            </h2>
          </div>
          <div className="bg-white border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-brand-dark text-brand-ivory border-b-2 border-brand-dark">
                <tr>
                  <th className="p-3">MISSION ID</th>
                  <th className="p-3">SHINOBI BUYER</th>
                  <th className="p-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/15">
                {data.recentMissions && data.recentMissions.length > 0 ? (
                  data.recentMissions.map((mission) => (
                    <tr
                      key={mission.id}
                      className="hover:bg-orange-500/5 transition-colors"
                    >
                      <td className="p-3 font-bold text-brand-dark">
                        #{mission.id}
                      </td>
                      <td className="p-3 font-bold">{mission.ninja}</td>
                      <td className="p-3 uppercase">{mission.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-4 text-center text-brand-dark/50 font-bold"
                    >
                      NO RECENT MISSIONS FOUND
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border-2 border-brand-dark p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-brand-dark/15 text-rose-600">
              <AlertTriangle size={18} />
              <h3 className="font-heading text-sm tracking-wider uppercase">
                LOW STOCK
              </h3>
            </div>
            <div className="space-y-2">
              {data.lowStockItems && data.lowStockItems.length > 0 ? (
                data.lowStockItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-brand-ivory/30 border border-brand-dark/20 flex justify-between text-xs font-mono"
                  >
                    <span className="font-bold">{item.name}</span>
                    <span className="text-amber-600 font-bold">
                      {item.stock} LEFT
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-brand-dark/50 font-bold">
                  ALL GEAR IS WELL STOCKED
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
