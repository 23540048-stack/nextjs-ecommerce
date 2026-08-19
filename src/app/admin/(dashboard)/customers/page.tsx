"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  Crown,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  MapPin,
  ShoppingBag,
  DollarSign,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  village: string;
  rank: "S-RANK VIP" | "JONIN" | "CHUNIN" | "GENIN" | "ROGUE";
  status: "active" | "suspended" | "vip";
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  lastOrderDate: string;
  avatar?: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "CUST-901",
    name: "Sasuke Uchiha",
    email: "sasuke@shadow-leaf.com",
    phone: "+84 901 234 567",
    village: "Hidden Leaf (Uchiha Compound)",
    rank: "S-RANK VIP",
    status: "vip",
    totalOrders: 18,
    totalSpent: 2450.0,
    joinedDate: "2025-01-15",
    lastOrderDate: "2026-08-10",
  },
  {
    id: "CUST-902",
    name: "Kakashi Hatake",
    email: "kakashi.copy6th@leaf.gov",
    phone: "+84 912 345 678",
    village: "Hidden Leaf Village",
    rank: "JONIN",
    status: "active",
    totalOrders: 12,
    totalSpent: 1120.5,
    joinedDate: "2025-03-20",
    lastOrderDate: "2026-07-28",
  },
  {
    id: "CUST-903",
    name: "Naruto Uzumaki",
    email: "ramen.hokage7@leaf.gov",
    phone: "+84 923 456 789",
    village: "Hidden Leaf (Hokage Estate)",
    rank: "S-RANK VIP",
    status: "vip",
    totalOrders: 25,
    totalSpent: 3890.0,
    joinedDate: "2024-11-01",
    lastOrderDate: "2026-08-12",
  },
  {
    id: "CUST-904",
    name: "Gaara of the Sand",
    email: "kazekage@sand-village.org",
    phone: "+84 934 567 890",
    village: "Hidden Sand Village",
    rank: "JONIN",
    status: "active",
    totalOrders: 8,
    totalSpent: 840.0,
    joinedDate: "2025-06-10",
    lastOrderDate: "2026-06-15",
  },
  {
    id: "CUST-905",
    name: "Orochimaru Snake",
    email: "lab.experimental@sound-village.com",
    phone: "+84 945 678 901",
    village: "Hidden Sound Hideout #4",
    rank: "ROGUE",
    status: "suspended",
    totalOrders: 3,
    totalSpent: 290.0,
    joinedDate: "2025-08-01",
    lastOrderDate: "2025-11-20",
  },
  {
    id: "CUST-906",
    name: "Shikamaru Nara",
    email: "shika.tactics@leaf.gov",
    phone: "+84 956 789 012",
    village: "Hidden Leaf (Nara Forest)",
    rank: "CHUNIN",
    status: "active",
    totalOrders: 6,
    totalSpent: 510.0,
    joinedDate: "2025-09-12",
    lastOrderDate: "2026-05-04",
  },
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rankFilter, setRankFilter] = useState<string>("all");

  // State quản lý Modal đăng ký Ninja mới
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Form states cho Ninja mới
  const [newNinja, setNewNinja] = useState({
    name: "",
    email: "",
    village: "Hidden Leaf Village",
    rank: "GENIN" as Customer["rank"],
  });

  const handleRegisterNinja = (e: React.FormEvent) => {
    e.preventDefault();
    const createdCustomer: Customer = {
      id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      name: newNinja.name,
      email: newNinja.email,
      phone: "+84 999 000 111",
      village: newNinja.village,
      rank: newNinja.rank,
      status: "active",
      totalOrders: 0,
      totalSpent: 0,
      joinedDate: new Date().toISOString().split("T")[0],
      lastOrderDate: "N/A",
    };

    setCustomers([createdCustomer, ...customers]);
    setIsRegisterModalOpen(false);
    setNewNinja({
      name: "",
      email: "",
      village: "Hidden Leaf Village",
      rank: "GENIN",
    });
  };

  // Lọc danh sách
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.village.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : cust.status === statusFilter;

    const matchesRank = rankFilter === "all" ? true : cust.rank === rankFilter;

    return matchesSearch && matchesStatus && matchesRank;
  });

  const getStatusBadge = (status: Customer["status"]) => {
    switch (status) {
      case "vip":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/30">
            <Crown size={12} /> S-VIP
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
            <UserCheck size={12} /> ACTIVE
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-rose-500/10 text-rose-600 border border-rose-500/30">
            <UserX size={12} /> SUSPENDED
          </span>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-brand-dark p-6 sm:p-8 font-mono space-y-8">
      {/* HEADER & BREADCRUMB */}
      <div className="border-b border-brand-dark/15 pb-6">
        <div className="flex items-center gap-2 text-xs text-brand-dark/60 uppercase mb-2">
          <Link
            href="/admin"
            className="hover:text-orange-500 transition-colors"
          >
            ADMIN DASHBOARD
          </Link>
          <ChevronRight size={14} />
          <span className="text-brand-dark font-bold">SHINOBI CUSTOMERS</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading tracking-wide uppercase">
              SHINOBI REGISTER ROSTER
            </h1>
            <p className="text-xs text-brand-dark/60 mt-1">
              MANAGE USER ACCOUNTS, NINJA RANKS, AND REVENUE ANALYTICS
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" icon={Download}>
              EXPORT CSV
            </Button>

            {/* Nút REGISTER NINJA bấm mở Modal */}
            <Button
              variant="chakra"
              size="sm"
              icon={Plus}
              onClick={() => setIsRegisterModalOpen(true)}
            >
              REGISTER NINJA
            </Button>
          </div>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">TOTAL SHINOBI</span>
            <Users size={16} className="text-orange-500" />
          </div>
          <p className="text-3xl font-extrabold text-brand-dark">
            {customers.length}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold">
            +12% from last month
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">S-RANK VIP MEMBERS</span>
            <Crown size={16} className="text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-brand-dark">
            {customers.filter((c) => c.status === "vip").length}
          </p>
          <p className="text-[11px] text-brand-dark/50">
            High-value recurring clients
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">TOTAL REVENUE</span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-orange-600">
            $
            {customers
              .reduce((acc, c) => acc + c.totalSpent, 0)
              .toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-brand-dark/50">
            Lifetime customer spent
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">SUSPENDED ACCOUNTS</span>
            <ShieldAlert size={16} className="text-rose-500" />
          </div>
          <p className="text-3xl font-extrabold text-brand-dark">
            {customers.filter((c) => c.status === "suspended").length}
          </p>
          <p className="text-[11px] text-rose-600 font-bold">
            Rogue NINJAs restricted
          </p>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/40"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH BY NAME, EMAIL, VILLAGE, OR ID..."
            className="w-full bg-brand-dark/5 border border-brand-dark/20 pl-9 pr-3 py-2 text-xs outline-none focus:border-orange-500 placeholder:text-brand-dark/40 uppercase"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 border border-brand-dark/20 px-3 py-1.5 bg-brand-dark/5">
            <Filter size={12} className="text-brand-dark/60" />
            <span className="font-bold uppercase text-[10px] text-brand-dark/60">
              STATUS:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none font-bold uppercase cursor-pointer text-xs"
            >
              <option value="all">ALL STATUSES</option>
              <option value="vip">S-VIP</option>
              <option value="active">ACTIVE</option>
              <option value="suspended">SUSPENDED</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border border-brand-dark/20 px-3 py-1.5 bg-brand-dark/5">
            <span className="font-bold uppercase text-[10px] text-brand-dark/60">
              RANK:
            </span>
            <select
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value)}
              className="bg-transparent outline-none font-bold uppercase cursor-pointer text-xs"
            >
              <option value="all">ALL RANKS</option>
              <option value="S-RANK VIP">S-RANK VIP</option>
              <option value="JONIN">JONIN</option>
              <option value="CHUNIN">CHUNIN</option>
              <option value="ROGUE">ROGUE</option>
            </select>
          </div>
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="border border-brand-dark/15 overflow-x-auto bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-brand-dark text-white uppercase text-[11px] tracking-wider border-b border-brand-dark">
              <th className="py-3 px-4">SHINOBI ID & NAME</th>
              <th className="py-3 px-4">VILLAGE / LOCATION</th>
              <th className="py-3 px-4">RANK & STATUS</th>
              <th className="py-3 px-4 text-center">ORDERS</th>
              <th className="py-3 px-4 text-right">TOTAL SPENT</th>
              <th className="py-3 px-4">LAST DISPATCH</th>
              <th className="py-3 px-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-dark/10">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-brand-dark/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-dark/10 border border-brand-dark/20 flex items-center justify-center font-bold text-brand-dark text-sm shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="font-bold text-brand-dark hover:text-orange-600 transition-colors uppercase block"
                        >
                          {customer.name}
                        </Link>
                        <span className="text-[11px] text-brand-dark/50 block font-sans">
                          {customer.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-brand-dark/80">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-orange-500 shrink-0" />
                      <span className="truncate max-w-45">
                        {customer.village}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[10px] bg-brand-dark/5 px-1.5 py-0.5 border border-brand-dark/10">
                        {customer.rank}
                      </span>
                      {getStatusBadge(customer.status)}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center font-bold">
                    <div className="inline-flex items-center gap-1">
                      <ShoppingBag size={12} className="text-brand-dark/40" />
                      {customer.totalOrders}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right font-bold text-orange-600">
                    $
                    {customer.totalSpent.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>

                  <td className="py-4 px-4 text-brand-dark/60 text-[11px]">
                    {customer.lastOrderDate}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/customers/${customer.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          title="View Full Profile"
                        >
                          XEM
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-brand-dark/50 border-t border-brand-dark/10"
                >
                  NO SHINOBI RECORDS FOUND MATCHING FILTER CRITERIA.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: REGISTER NEW NINJA */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="ĐĂNG KÝ SHINOBI MỚI (REGISTER NINJA)"
        maxWidth="md"
      >
        <form onSubmit={handleRegisterNinja} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1 uppercase">
              Tên Shinobi
            </label>
            <Input
              required
              value={newNinja.name}
              onChange={(e) =>
                setNewNinja({ ...newNinja, name: e.target.value })
              }
              placeholder="VD: Uzumaki Boruto"
              className="border border-brand-dark/20 text-brand-dark focus:border-orange-500 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1 uppercase">
              Email
            </label>
            <Input
              type="email"
              required
              value={newNinja.email}
              onChange={(e) =>
                setNewNinja({ ...newNinja, email: e.target.value })
              }
              placeholder="boruto@leaf.gov"
              className="border border-brand-dark/20 text-brand-dark focus:border-orange-500 font-bold text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1 uppercase">
                Cấp bậc (Rank)
              </label>
              <select
                value={newNinja.rank}
                onChange={(e) =>
                  setNewNinja({
                    ...newNinja,
                    rank: e.target.value as Customer["rank"],
                  })
                }
                className="w-full px-3 py-2 text-xs font-bold border border-brand-dark/20 text-brand-dark bg-white focus:outline-none focus:border-orange-500"
              >
                <option value="GENIN">GENIN</option>
                <option value="CHUNIN">CHUNIN</option>
                <option value="JONIN">JONIN</option>
                <option value="S-RANK VIP">S-RANK VIP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1 uppercase">
                Làng (Village)
              </label>
              <Input
                value={newNinja.village}
                onChange={(e) =>
                  setNewNinja({ ...newNinja, village: e.target.value })
                }
                className="border border-brand-dark/20 text-brand-dark focus:border-orange-500 font-bold text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-brand-dark/15">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRegisterModalOpen(false)}
            >
              HỦY
            </Button>
            <Button type="submit" variant="chakra" size="sm" icon={Plus}>
              XÁC NHẬN ĐĂNG KÝ
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
