"use client";

import {
  Crown,
  ShieldCheck,
  Siren,
  TrafficCone,
  Building2,
  ClipboardList,
} from "lucide-react";
import type { TaskTypeKey } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  royal_security: Crown,
  vip_protection: ShieldCheck,
  convoy: Siren,
  traffic: TrafficCone,
  venue_security: Building2,
};

interface TaskTypeIconProps {
  typeKey: string;
  className?: string;
  color?: string;
}

export default function TaskTypeIcon({ typeKey, className = "w-5 h-5", color }: TaskTypeIconProps) {
  const Icon = ICON_MAP[typeKey] || ClipboardList;
  return <Icon className={className} style={color ? { color } : undefined} />;
}

export { ICON_MAP };
