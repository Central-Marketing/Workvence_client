import React from "react";
import type { Metadata } from "next";
import PressClient from "./PressClient";

export const metadata: Metadata = {
  title: "Press, News & Media Resources | Workvence Newsroom",
  description: "Official news, product announcements, company milestones, and downloadable media brand assets from Workvence.",
};

export default function PressPage() {
  return <PressClient />;
}
