// src/app/admin/marketing/flash-sale/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Power,
  ChevronRight,
  Clock,
  Package,
  Flame,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

interface FlashSaleItem {
  id: string;
  title: string;
  timeSlot: string; // e.g., "12:00 - 14:00"
  status: "active" | "upcoming" | "ended";
  discountPercent: number;
  totalStock: number;
  soldCount: number;
  startDate: string;
}

const MOCK_FLASH_SALES: FlashSaleItem[] = [
  {
    id: "FS-001",
    title: "MIDDAY CHUNIN DASH - 50% OFF GEAR",
    timeSlot: "12:00 - 14:00",
    status: "active",
    discountPercent: 50,
    totalStock: 100,
    soldCount: 84,
    startDate: "2026-08-13",
  },
  {
    id: "FS-002",
    title: "NIGHT NINJA FLASH SALE",
    timeSlot: "20:00 - 22:00",
    status: "upcoming",
    discountPercent: 70,
    totalStock: 50,
    soldCount: 0,
    startDate: "2026-08-13",
  },
  {
    id: "FS-003",
    title: "MORNING RUSH FIGURE DROP",
    timeSlot: "08:00 - 10:00",
    status: "ended",
    discountPercent: 40,
    totalStock: 200,
    soldCount: 200,
    startDate: "2026-08-12",
  },
];

export default function FlashSalePage() {
  const [flashSales, setFlashSales] =
    useState<FlashSaleItem[]>(MOCK_FLASH_SALES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<FlashSaleItem | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    timeSlot: "12:00 - 14:00",
    discountPercent: "",
    totalStock: "",
    status: "upcoming" as FlashSaleItem["status"],
    startDate: new Date().toISOString().split("T")[0],
  });

  const handleOpenAddModal = () => {
    setSelectedSale(null);
    setFormData({
      title: "",
      timeSlot: "12:00 - 14:00",
      discountPercent: "50",
      totalStock: "100",
      status: "upcoming",
      startDate: new Date().toISOString().split("T")[0],
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (sale: FlashSaleItem) => {
    setSelectedSale(sale);
    setFormData({
      title: sale.title,
      timeSlot: sale.timeSlot,
      discountPercent: sale.discountPercent.toString(),
      totalStock: sale.totalStock.toString(),
      status: sale.status,
      startDate: sale.startDate,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (sale: FlashSaleItem) => {
    setSelectedSale(sale);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setFlashSales((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "active" ? "ended" : "active";
          return { ...item, status: nextStatus };
        }
        return item;
      }),
    );
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSale) {
      setFlashSales((prev) =>
        prev.map((item) =>
          item.id === selectedSale.id
            ? {
                ...item,
                ...formData,
                discountPercent: Number(formData.discountPercent),
                totalStock: Number(formData.totalStock),
              }
            : item,
        ),
      );
    } else {
      const newSale: FlashSaleItem = {
        id: `FS-${Math.floor(100 + Math.random() * 900)}`,
        ...formData,
        discountPercent: Number(formData.discountPercent),
        totalStock: Number(formData.totalStock),
        soldCount: 0,
      };
      setFlashSales([newSale, ...flashSales]);
    }
    setIsFormModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedSale) {
      setFlashSales((prev) => prev.filter((s) => s.id !== selectedSale.id));
    }
    setIsDeleteModalOpen(false);
    setSelectedSale(null);
  };

  const filteredSales = flashSales.filter((sale) => {
    const matchesSearch =
      sale.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : sale.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full min-h-screen bg-white text-brand-dark p-6 sm:p-8 font-mono space-y-8">
      {/* HEADER & BREADCRUMB */}
      <div className="border-b-2 border-brand-dark/15 pb-6">
        <div className="flex items-center gap-2 text-xs text-brand-dark/60 uppercase mb-2">
          <Link
            href="/admin"
            className="hover:text-orange-500 transition-colors"
          >
            ADMIN DASHBOARD
          </Link>
          <ChevronRight size={14} />
          <span>MARKETING</span>
          <ChevronRight size={14} />
          <span className="text-brand-dark font-bold">FLASH SALE</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase flex items-center gap-2">
              <Zap className="text-amber-500 fill-amber-500" size={28} /> FLASH
              SALE CAMPAIGNS
            </h1>
            <p className="text-xs text-brand-dark/60 mt-1">
              SCHEDULE TIME-LIMITED DISCOUNTS AND MONITOR LIVE INVENTORY DASHES
            </p>
          </div>

          <Button
            variant="chakra"
            size="sm"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            CREATE FLASH SALE
          </Button>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border-2 border-brand-dark p-4 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs font-bold uppercase">
            <span>LIVE CAMPAIGNS</span>
            <Flame size={16} className="text-orange-600" />
          </div>
          <p className="text-2xl font-extrabold text-orange-600">
            {flashSales.filter((s) => s.status === "active").length}
          </p>
        </div>

        <div className="border-2 border-brand-dark p-4 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs font-bold uppercase">
            <span>UPCOMING SLOTS</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">
            {flashSales.filter((s) => s.status === "upcoming").length}
          </p>
        </div>

        <div className="border-2 border-brand-dark p-4 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs font-bold uppercase">
            <span>ITEMS SOLD</span>
            <Package size={16} className="text-sky-500" />
          </div>
          <p className="text-2xl font-extrabold">
            {flashSales.reduce((acc, curr) => acc + curr.soldCount, 0)}
          </p>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <Input
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH BY TITLE OR ID..."
          className="uppercase"
        />

        <div className="flex items-center gap-2 border-2 border-brand-dark px-3 py-2 bg-brand-ivory/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Filter size={14} className="text-brand-dark/60" />
          <span className="font-bold text-[10px] text-brand-dark/60 uppercase">
            STATUS:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent outline-none font-bold uppercase cursor-pointer text-xs"
          >
            <option value="all">ALL</option>
            <option value="active">ACTIVE</option>
            <option value="upcoming">UPCOMING</option>
            <option value="ended">ENDED</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="border-2 border-brand-dark overflow-x-auto bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-brand-dark text-white uppercase text-[11px] tracking-wider border-b-2 border-brand-dark">
              <th className="py-3 px-4">CAMPAIGN</th>
              <th className="py-3 px-4">TIME SLOT</th>
              <th className="py-3 px-4">DISCOUNT</th>
              <th className="py-3 px-4">PROGRESS (SOLD/TOTAL)</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-dark/15">
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => {
                const progressPercent = Math.round(
                  (sale.soldCount / sale.totalStock) * 100,
                );
                return (
                  <tr
                    key={sale.id}
                    className="hover:bg-brand-dark/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-bold uppercase text-brand-dark block">
                        {sale.title}
                      </span>
                      <span className="text-[10px] text-brand-dark/50">
                        {sale.id} • {sale.startDate}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-dark/5 border border-brand-dark/20 text-[10px]">
                        <Clock size={12} className="text-amber-500" />
                        {sale.timeSlot}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-extrabold text-orange-600">
                      -{sale.discountPercent}% OFF
                    </td>

                    <td className="py-4 px-4 min-w-[160px]">
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span>{sale.soldCount} Sold</span>
                        <span>{sale.totalStock} Max</span>
                      </div>
                      <div className="w-full h-2 bg-brand-dark/10 border border-brand-dark/30 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all duration-300"
                          style={{
                            width: `${Math.min(progressPercent, 100)}%`,
                          }}
                        />
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {sale.status === "active" && (
                        <Badge variant="orange" size="sm">
                          ACTIVE
                        </Badge>
                      )}
                      {sale.status === "upcoming" && (
                        <Badge variant="new" size="sm">
                          UPCOMING
                        </Badge>
                      )}
                      {sale.status === "ended" && (
                        <Badge variant="outline" size="sm">
                          ENDED
                        </Badge>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(sale.id)}
                          className={`p-1.5 border transition-colors ${
                            sale.status === "active"
                              ? "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                              : "border-rose-500/40 text-rose-600 hover:bg-rose-500/10"
                          }`}
                        >
                          <Power size={13} />
                        </button>

                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleOpenEditModal(sale)}
                        >
                          EDIT
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleOpenDeleteModal(sale)}
                        >
                          DELETE
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-brand-dark/50"
                >
                  NO FLASH SALES FOUND.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedSale ? "EDIT FLASH SALE" : "CREATE NEW FLASH SALE"}
        maxWidth="md"
      >
        <form
          onSubmit={handleSubmitForm}
          className="space-y-4 text-xs font-mono"
        >
          <Input
            label="CAMPAIGN TITLE *"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g. Midday Shinobi Blitz Sale"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-dark uppercase block">
                TIME SLOT
              </label>
              <select
                value={formData.timeSlot}
                onChange={(e) =>
                  setFormData({ ...formData, timeSlot: e.target.value })
                }
                className="w-full bg-brand-ivory/20 border-2 border-brand-dark p-2 text-xs font-bold uppercase focus:outline-hidden focus:border-orange-600"
              >
                <option value="08:00 - 10:00">08:00 - 10:00</option>
                <option value="12:00 - 14:00">12:00 - 14:00</option>
                <option value="16:00 - 18:00">16:00 - 18:00</option>
                <option value="20:00 - 22:00">20:00 - 22:00</option>
              </select>
            </div>

            <Input
              label="START DATE *"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="DISCOUNT PERCENT (%) *"
              type="number"
              required
              value={formData.discountPercent}
              onChange={(e) =>
                setFormData({ ...formData, discountPercent: e.target.value })
              }
              placeholder="50"
            />

            <Input
              label="TOTAL FLASH STOCK *"
              type="number"
              required
              value={formData.totalStock}
              onChange={(e) =>
                setFormData({ ...formData, totalStock: e.target.value })
              }
              placeholder="100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark uppercase block">
              STATUS
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as FlashSaleItem["status"],
                })
              }
              className="w-full bg-brand-ivory/20 border-2 border-brand-dark p-2 text-xs font-bold uppercase focus:outline-hidden focus:border-orange-600"
            >
              <option value="upcoming">UPCOMING</option>
              <option value="active">ACTIVE</option>
              <option value="ended">ENDED</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-brand-dark/15">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button type="submit" variant="chakra" size="sm" icon={Plus}>
              {selectedSale ? "SAVE CHANGES" : "CREATE FLASH SALE"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="DELETE FLASH SALE"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs font-mono">
          <p className="leading-relaxed text-brand-dark">
            Are you sure you want to delete flash sale campaign{" "}
            <strong className="text-rose-600 uppercase font-bold">
              {selectedSale?.title}
            </strong>
            ?
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-brand-dark/15">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleDelete}
            >
              CONFIRM DELETE
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
