"use client";

import React, { useState, useEffect, useRef } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Send, MapPin, Mail, Phone } from "lucide-react";

interface ContactHQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactHQModal({
  isOpen,
  onClose,
}: ContactHQModalProps) {
  const [sent, setSent] = useState(false);

  // States quản lý dữ liệu ô nhập
  const [ninjaName, setNinjaName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset form về trạng thái ban đầu khi Modal đóng
  useEffect(() => {
    if (!isOpen) {
      setSent(false);
      setNinjaName("");
      setEmail("");
      setMessage("");
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);

    timerRef.current = setTimeout(() => {
      setSent(false);
      onClose();
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CONTACT SHINOBI HQ"
      maxWidth="md"
    >
      <div className="space-y-6 text-xs font-mono text-brand-dark">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-brand-dark/15 pb-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-orange-600 shrink-0" />
            <span>KONOHA VILLAGE, BLDG #7</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-orange-600 shrink-0" />
            <span>HQ@SHINOBIGOODS.COM</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-orange-600 shrink-0" />
            <span>+84 (0) 900-SHINOBI</span>
          </div>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-500/10 border-2 border-emerald-600 text-emerald-700 font-bold text-center uppercase">
            ✓ MESSAGE TRANSMITTED TO ANBU DISPATCH. WE WILL RESPOND SHORTLY.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="YOUR NINJA NAME *"
              required
              placeholder="NARUTO UZUMAKI"
              value={ninjaName}
              onChange={(e) => setNinjaName(e.target.value)}
            />
            <Input
              label="EMAIL ADDRESS *"
              type="email"
              required
              placeholder="NARUTO@KONOHA.GOV"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-dark uppercase block">
                MESSAGE / TRANSMISSION *
              </label>
              <textarea
                required
                rows={3}
                placeholder="STATE YOUR INQUIRY OR MISSION DETAILS..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-brand-ivory/20 border-2 border-brand-dark p-2 text-xs font-mono uppercase focus:outline-none focus:border-orange-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                CANCEL
              </Button>
              <Button type="submit" variant="chakra" size="sm" icon={Send}>
                SEND TRANSMISSION
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
