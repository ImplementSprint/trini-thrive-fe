"use client";

import React from "react";
import SharedLayout from "@/donor-components/SharedLayout";
import HopecardProfile from "./HopecardProfile";

export default function ProfilePage() {
  return (
    <SharedLayout currentPage="settings">
      <HopecardProfile />
    </SharedLayout>
  );
}
