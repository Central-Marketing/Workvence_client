import React from "react";
import type { Metadata } from "next";
import CareersClient from "./CareersClient";

export const metadata: Metadata = {
  title: "Careers & Open Roles | Join Workvence",
  description: "Build the future of independent work. Join a global, remote-first team empowering millions of skilled creators, developers, and businesses.",
};

export default function CareersPage() {
  return <CareersClient />;
}
