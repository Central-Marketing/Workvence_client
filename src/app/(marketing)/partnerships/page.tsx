import React from "react";
import type { Metadata } from "next";
import PartnershipsClient from "./PartnershipsClient";

export const metadata: Metadata = {
  title: "Partnerships & Alliances | Workvence Partner Ecosystem",
  description: "Grow your agency, integrate your platform API, or expand enterprise services through the Workvence Partner Program.",
};

export default function PartnershipsPage() {
  return <PartnershipsClient />;
}
