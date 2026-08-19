"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Plus,
  Mail,
  Phone,
  Trash2,
  Edit,
  ChevronRight,
  Briefcase,
  AlertTriangle,
  Power,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  village: string;
  role:
    | "HOKAGE (ADMIN)"
    | "JOUNIN (MANAGER)"
    | "CHUNIN (STAFF)"
    | "GENIN (INTERN)";
  department: string;
  status: "active" | "suspended";
  joinedDate: string;
}

const MOCK_STAFF: StaffMember[] = [
  {
    id: "STF-001",
    name: "Naruto Uzumaki",
    email: "naruto@leafguild.com",
    phone: "+84 901 234 567",
    village: "Hidden Leaf Village",
    role: "HOKAGE (ADMIN)",
    department: "Executive Board",
    status: "active",
    joinedDate: "2023-01-15",
  },
  {
    id: "STF-002",
    name: "Kakashi Hatake",
    email: "kakashi@leafguild.com",
    phone: "+84 912 345 678",
    village: "Hidden Leaf Village",
    role: "JOUNIN (MANAGER)",
    department: "Inventory & Logistics",
    status: "active",
    joinedDate: "2023-02-01",
  },
  {
    id: "STF-003",
    name: "Sakura Haruno",
    email: "sakura@leafguild.com",
    phone: "+84 923 456 789",
    village: "Hidden Leaf Village",
    role: "CHUNIN (STAFF)",
    department: "Customer Support",
    status: "active",
    joinedDate: "2023-05-10",
  },
  {
    id: "STF-004",
    name: "Shikamaru Nara",
    email: "shikamaru@leafguild.com",
    phone: "+84 934 567 890",
    village: "Hidden Leaf Village",
    role: "JOUNIN (MANAGER)",
    department: "Strategy & Marketing",
    status: "active",
    joinedDate: "2023-03-20",
  },
  {
    id: "STF-005",
    name: "Rock Lee",
    email: "rocklee@leafguild.com",
    phone: "+84 945 678 901",
    village: "Hidden Leaf Village",
    role: "GENIN (INTERN)",
    department: "Dispatch & Logistics",
    status: "suspended",
    joinedDate: "2024-01-08",
  },
];

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(MOCK_STAFF);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // States quản lý Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Form State cho Add / Edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Operations",
    role: "CHUNIN (STAFF)" as StaffMember["role"],
    status: "active" as StaffMember["status"],
    village: "Hidden Leaf Village",
  });

  const handleOpenAddModal = () => {
    setSelectedStaff(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "Operations",
      role: "CHUNIN (STAFF)",
      status: "active",
      village: "Hidden Leaf Village",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      department: staff.department,
      role: staff.role,
      status: staff.status,
      village: staff.village,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsDeleteModalOpen(true);
  };

  // Toggle trạng thái Active / Suspended trực tiếp trên danh sách
  const handleToggleStatus = (id: string) => {
    setStaffList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "active" ? "suspended" : "active",
            }
          : item,
      ),
    );
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaff) {
      setStaffList((prev) =>
        prev.map((item) =>
          item.id === selectedStaff.id ? { ...item, ...formData } : item,
        ),
      );
    } else {
      const newMember: StaffMember = {
        id: `STF-${Math.floor(100 + Math.random() * 900)}`,
        ...formData,
        joinedDate: new Date().toISOString().split("T")[0],
      };
      setStaffList([newMember, ...staffList]);
    }
    setIsFormModalOpen(false);
  };

  const handleDeleteStaff = () => {
    if (selectedStaff) {
      setStaffList((prev) =>
        prev.filter((item) => item.id !== selectedStaff.id),
      );
    }
    setIsDeleteModalOpen(false);
    setSelectedStaff(null);
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" ? true : staff.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ? true : staff.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: StaffMember["role"]) => {
    switch (role) {
      case "HOKAGE (ADMIN)":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-rose-500/10 text-rose-600 border border-rose-500/30">
            {role}
          </span>
        );
      case "JOUNIN (MANAGER)":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/30">
            {role}
          </span>
        );
      case "CHUNIN (STAFF)":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-sky-500/10 text-sky-600 border border-sky-500/30">
            {role}
          </span>
        );
      case "GENIN (INTERN)":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
            {role}
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
          <span className="text-brand-dark font-bold">STAFF DIRECTORY</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading tracking-wide uppercase">
              SHINOBI STAFF ROSTER
            </h1>
            <p className="text-xs text-brand-dark/60 mt-1">
              MANAGE INTERNAL PERSONNEL, ACCESS ROLES, AND DEPARTMENTS
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" icon={Download}>
              EXPORT CSV
            </Button>
            <Button
              variant="chakra"
              size="sm"
              icon={Plus}
              onClick={handleOpenAddModal}
            >
              ADD NEW STAFF
            </Button>
          </div>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">TOTAL STAFF</span>
            <Users size={16} className="text-orange-500" />
          </div>
          <p className="text-3xl font-extrabold text-brand-dark">
            {staffList.length}
          </p>
          <p className="text-[11px] text-brand-dark/50">
            Active roster members
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">ACTIVE NINJA</span>
            <UserCheck size={16} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">
            {staffList.filter((s) => s.status === "active").length}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold">
            Ready for deployment
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">MANAGEMENT LEVEL</span>
            <ShieldCheck size={16} className="text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-orange-600">
            {
              staffList.filter(
                (s) =>
                  s.role === "HOKAGE (ADMIN)" || s.role === "JOUNIN (MANAGER)",
              ).length
            }
          </p>
          <p className="text-[11px] text-brand-dark/50">
            Hokage & Jounin leaders
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">SUSPENDED ACCESS</span>
            <UserX size={16} className="text-rose-500" />
          </div>
          <p className="text-3xl font-extrabold text-brand-dark">
            {staffList.filter((s) => s.status === "suspended").length}
          </p>
          <p className="text-[11px] text-rose-600 font-bold">
            Restricted accounts
          </p>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/40"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH BY NAME, EMAIL, DEPARTMENT, OR ID..."
            className="w-full bg-brand-dark/5 border border-brand-dark/20 pl-9 pr-3 py-2 text-xs outline-none focus:border-orange-500 placeholder:text-brand-dark/40 uppercase"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 border border-brand-dark/20 px-3 py-1.5 bg-brand-dark/5">
            <Filter size={12} className="text-brand-dark/60" />
            <span className="font-bold uppercase text-[10px] text-brand-dark/60">
              ROLE:
            </span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent outline-none font-bold uppercase cursor-pointer text-xs"
            >
              <option value="all">ALL ROLES</option>
              <option value="HOKAGE (ADMIN)">HOKAGE (ADMIN)</option>
              <option value="JOUNIN (MANAGER)">JOUNIN (MANAGER)</option>
              <option value="CHUNIN (STAFF)">CHUNIN (STAFF)</option>
              <option value="GENIN (INTERN)">GENIN (INTERN)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border border-brand-dark/20 px-3 py-1.5 bg-brand-dark/5">
            <span className="font-bold uppercase text-[10px] text-brand-dark/60">
              STATUS:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none font-bold uppercase cursor-pointer text-xs"
            >
              <option value="all">ALL STATUSES</option>
              <option value="active">ACTIVE</option>
              <option value="suspended">SUSPENDED</option>
            </select>
          </div>
        </div>
      </div>

      {/* STAFF TABLE */}
      <div className="border border-brand-dark/15 overflow-x-auto bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-brand-dark text-white uppercase text-[11px] tracking-wider border-b border-brand-dark">
              <th className="py-3 px-4">STAFF ID & NAME</th>
              <th className="py-3 px-4">ROLE / RANK</th>
              <th className="py-3 px-4">DEPARTMENT</th>
              <th className="py-3 px-4">CONTACT INFO</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4">JOINED DATE</th>
              <th className="py-3 px-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-dark/10">
            {filteredStaff.length > 0 ? (
              filteredStaff.map((staff) => (
                <tr
                  key={staff.id}
                  className="hover:bg-brand-dark/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-dark/10 border border-brand-dark/20 flex items-center justify-center font-bold text-brand-dark text-sm shrink-0">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-brand-dark uppercase block">
                          {staff.name}
                        </span>
                        <span className="text-[11px] text-brand-dark/50 block font-sans">
                          {staff.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">{getRoleBadge(staff.role)}</td>

                  <td className="py-4 px-4 font-bold text-brand-dark/80">
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={12} className="text-orange-500" />
                      {staff.department}
                    </div>
                  </td>

                  <td className="py-4 px-4 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-brand-dark/80">
                      <Mail size={12} className="text-brand-dark/40" />
                      <span>{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-brand-dark/60">
                      <Phone size={12} className="text-brand-dark/40" />
                      <span>{staff.phone}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    {staff.status === "active" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                        <UserCheck size={10} /> ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-rose-500/10 text-rose-600 border border-rose-500/30">
                        <UserX size={10} /> SUSPENDED
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-brand-dark/60 text-[11px]">
                    {staff.joinedDate}
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Nút Toggle Status */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(staff.id)}
                        title={
                          staff.status === "active"
                            ? "Suspend Account"
                            : "Activate Account"
                        }
                        className={`p-1.5 border transition-colors ${
                          staff.status === "active"
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
                        onClick={() => handleOpenEditModal(staff)}
                      >
                        EDIT
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleOpenDeleteModal(staff)}
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
                  className="py-12 text-center text-brand-dark/50 border-t border-brand-dark/10"
                >
                  NO STAFF MEMBERS FOUND MATCHING FILTER CRITERIA.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: ADD / EDIT STAFF */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedStaff ? "EDIT STAFF MEMBER" : "REGISTER NEW STAFF"}
        maxWidth="md"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1 uppercase">
              Full Name
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="E.g. Kakashi Hatake"
              className="border border-brand-dark/20 text-brand-dark focus:border-orange-500 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1 uppercase">
              Email Address
            </label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="kakashi@leafguild.com"
              className="border border-brand-dark/20 text-brand-dark focus:border-orange-500 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1 uppercase">
              Phone Number
            </label>
            <Input
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+84 912 345 678"
              className="border border-brand-dark/20 text-brand-dark focus:border-orange-500 font-bold text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1 uppercase">
                Access Level / Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as StaffMember["role"],
                  })
                }
                className="w-full px-3 py-2 text-xs font-bold border border-brand-dark/20 text-brand-dark bg-white focus:outline-none focus:border-orange-500"
              >
                <option value="GENIN (INTERN)">GENIN (INTERN)</option>
                <option value="CHUNIN (STAFF)">CHUNIN (STAFF)</option>
                <option value="JOUNIN (MANAGER)">JOUNIN (MANAGER)</option>
                <option value="HOKAGE (ADMIN)">HOKAGE (ADMIN)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1 uppercase">
                Department
              </label>
              <Input
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Logistics"
                className="border border-brand-dark/20 text-brand-dark focus:border-orange-500 font-bold text-xs"
              />
            </div>
          </div>

          {/* CHỌN TRẠNG THÁI ACTIVE / SUSPENDED IN FORM */}
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1 uppercase">
              Account Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as StaffMember["status"],
                })
              }
              className="w-full px-3 py-2 text-xs font-bold border border-brand-dark/20 text-brand-dark bg-white focus:outline-none focus:border-orange-500 uppercase"
            >
              <option value="active">ACTIVE</option>
              <option value="suspended">SUSPENDED</option>
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
              {selectedStaff ? "SAVE CHANGES" : "REGISTER STAFF"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: CONFIRM DELETE */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="CONFIRM TERMINATION"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700">
            <AlertTriangle
              className="shrink-0 text-rose-600 mt-0.5"
              size={18}
            />
            <p className="leading-relaxed">
              Are you sure you want to remove{" "}
              <strong className="underline font-bold uppercase text-rose-800">
                {selectedStaff?.name}
              </strong>{" "}
              from the active roster? Access to system tools will be revoked
              immediately.
            </p>
          </div>

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
              onClick={handleDeleteStaff}
            >
              CONFIRM DELETE
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
