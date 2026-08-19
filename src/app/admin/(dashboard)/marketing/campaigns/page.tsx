// src/app/admin/marketing/campaigns/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Power,
  ChevronRight,
  Calendar,
  DollarSign,
  TrendingUp,
  Target,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

interface CampaignItem {
  id: string;
  name: string;
  type: "Seasonal" | "Product Launch" | "Flash Event" | "Collaboration";
  startDate: string;
  endDate: string;
  budget: number;
  targetRevenue: number;
  status: "active" | "upcoming" | "ended";
}

const MOCK_CAMPAIGNS: CampaignItem[] = [
  {
    id: "CAMP-001",
    name: "SUMMER SHINOBI FESTIVAL 2026",
    type: "Seasonal",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    budget: 50000000,
    targetRevenue: 250000000,
    status: "active",
  },
  {
    id: "CAMP-002",
    name: "CYBERPUNK EDGERUNNERS MERCH DROP",
    type: "Product Launch",
    startDate: "2026-09-01",
    endDate: "2026-09-15",
    budget: 20000000,
    targetRevenue: 100000000,
    status: "upcoming",
  },
  {
    id: "CAMP-003",
    name: "GENSHIN IMPACT COLLAB EXPO",
    type: "Collaboration",
    startDate: "2026-01-10",
    endDate: "2026-02-10",
    budget: 80000000,
    targetRevenue: 400000000,
    status: "ended",
  },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(MOCK_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(
    null,
  );

  const [formData, setFormData] = useState({
    name: "",
    type: "Seasonal" as CampaignItem["type"],
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    budget: "",
    targetRevenue: "",
    status: "upcoming" as CampaignItem["status"],
  });

  const handleOpenAddModal = () => {
    setSelectedCampaign(null);
    setFormData({
      name: "",
      type: "Seasonal",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      budget: "",
      targetRevenue: "",
      status: "upcoming",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (camp: CampaignItem) => {
    setSelectedCampaign(camp);
    setFormData({
      name: camp.name,
      type: camp.type,
      startDate: camp.startDate,
      endDate: camp.endDate,
      budget: camp.budget.toString(),
      targetRevenue: camp.targetRevenue.toString(),
      status: camp.status,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (camp: CampaignItem) => {
    setSelectedCampaign(camp);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setCampaigns((prev) =>
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
    if (selectedCampaign) {
      setCampaigns((prev) =>
        prev.map((item) =>
          item.id === selectedCampaign.id
            ? {
                ...item,
                ...formData,
                budget: Number(formData.budget),
                targetRevenue: Number(formData.targetRevenue),
              }
            : item,
        ),
      );
    } else {
      const newCampaign: CampaignItem = {
        id: `CAMP-${Math.floor(100 + Math.random() * 900)}`,
        ...formData,
        budget: Number(formData.budget),
        targetRevenue: Number(formData.targetRevenue),
      };
      setCampaigns([newCampaign, ...campaigns]);
    }
    setIsFormModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedCampaign) {
      setCampaigns((prev) => prev.filter((c) => c.id !== selectedCampaign.id));
    }
    setIsDeleteModalOpen(false);
    setSelectedCampaign(null);
  };

  const filteredCampaigns = campaigns.filter((camp) => {
    const matchesSearch =
      camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : camp.status === statusFilter;

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
          <span className="text-brand-dark font-bold">CAMPAIGNS</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase flex items-center gap-2">
              <Megaphone className="text-orange-600" size={28} /> MARKETING
              CAMPAIGNS
            </h1>
            <p className="text-xs text-brand-dark/60 mt-1">
              PLAN, EXECUTE AND MONITOR HIGH-IMPACT PROMOTIONAL EVENTS
            </p>
          </div>

          <Button
            variant="chakra"
            size="sm"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            CREATE CAMPAIGN
          </Button>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border-2 border-brand-dark p-4 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs font-bold uppercase">
            <span>ACTIVE CAMPAIGNS</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">
            {campaigns.filter((c) => c.status === "active").length}
          </p>
        </div>

        <div className="border-2 border-brand-dark p-4 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs font-bold uppercase">
            <span>TOTAL BUDGET ALLOCATED</span>
            <DollarSign size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-brand-dark">
            {campaigns
              .reduce((acc, curr) => acc + curr.budget, 0)
              .toLocaleString()}{" "}
            VND
          </p>
        </div>

        <div className="border-2 border-brand-dark p-4 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs font-bold uppercase">
            <span>TARGET REVENUE</span>
            <Target size={16} className="text-sky-500" />
          </div>
          <p className="text-2xl font-extrabold text-orange-600">
            {campaigns
              .reduce((acc, curr) => acc + curr.targetRevenue, 0)
              .toLocaleString()}{" "}
            VND
          </p>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <Input
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH CAMPAIGN BY NAME OR ID..."
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
              <th className="py-3 px-4">CAMPAIGN NAME</th>
              <th className="py-3 px-4">TYPE</th>
              <th className="py-3 px-4">TIMELINE</th>
              <th className="py-3 px-4">BUDGET</th>
              <th className="py-3 px-4">TARGET REVENUE</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-dark/15">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((camp) => (
                <tr
                  key={camp.id}
                  className="hover:bg-brand-dark/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="font-bold uppercase text-brand-dark block">
                      {camp.name}
                    </span>
                    <span className="text-[10px] text-brand-dark/50">
                      {camp.id}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-bold">
                    <span className="px-2 py-0.5 bg-brand-dark/5 border border-brand-dark/20 text-[10px] uppercase">
                      {camp.type}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-bold">
                    <span className="inline-flex items-center gap-1 text-[10px] text-brand-dark/80">
                      <Calendar size={12} className="text-amber-500" />
                      {camp.startDate} ~ {camp.endDate}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-bold">
                    {camp.budget.toLocaleString()} VND
                  </td>

                  <td className="py-4 px-4 font-extrabold text-orange-600">
                    {camp.targetRevenue.toLocaleString()} VND
                  </td>

                  <td className="py-4 px-4">
                    {camp.status === "active" && (
                      <Badge variant="orange" size="sm">
                        ACTIVE
                      </Badge>
                    )}
                    {camp.status === "upcoming" && (
                      <Badge variant="new" size="sm">
                        UPCOMING
                      </Badge>
                    )}
                    {camp.status === "ended" && (
                      <Badge variant="outline" size="sm">
                        ENDED
                      </Badge>
                    )}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(camp.id)}
                        className={`p-1.5 border transition-colors ${
                          camp.status === "active"
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
                        onClick={() => handleOpenEditModal(camp)}
                      >
                        EDIT
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleOpenDeleteModal(camp)}
                      >
                        DELETE
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-brand-dark/50"
                >
                  NO CAMPAIGNS FOUND.
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
        title={selectedCampaign ? "EDIT CAMPAIGN" : "CREATE NEW CAMPAIGN"}
        maxWidth="md"
      >
        <form
          onSubmit={handleSubmitForm}
          className="space-y-4 text-xs font-mono"
        >
          <Input
            label="CAMPAIGN NAME *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Winter Tokyo Festival 2026"
          />

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark uppercase block">
              CAMPAIGN TYPE
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as CampaignItem["type"],
                })
              }
              className="w-full bg-brand-ivory/20 border-2 border-brand-dark p-2 text-xs font-bold uppercase focus:outline-hidden focus:border-orange-600"
            >
              <option value="Seasonal">SEASONAL</option>
              <option value="Product Launch">PRODUCT LAUNCH</option>
              <option value="Flash Event">FLASH EVENT</option>
              <option value="Collaboration">COLLABORATION</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="START DATE *"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
            <Input
              label="END DATE *"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="BUDGET (VND) *"
              type="number"
              required
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
              placeholder="50000000"
            />
            <Input
              label="TARGET REVENUE (VND) *"
              type="number"
              required
              value={formData.targetRevenue}
              onChange={(e) =>
                setFormData({ ...formData, targetRevenue: e.target.value })
              }
              placeholder="250000000"
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
                  status: e.target.value as CampaignItem["status"],
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
              {selectedCampaign ? "SAVE CHANGES" : "CREATE CAMPAIGN"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="DELETE CAMPAIGN"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs font-mono">
          <p className="leading-relaxed text-brand-dark">
            Are you sure you want to delete marketing campaign{" "}
            <strong className="text-rose-600 uppercase font-bold">
              {selectedCampaign?.name}
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
