"use client";

import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/20/solid";
import { PackageProvider } from "./_components/PackageContext";
import PackageList from "./_components/PackageList";
import Sidebar from "./_components/Sidebar";

export default function Page() {
  return (
    <PackageProvider>
      <div className="hidden items-start divide-x md:flex">
        <div className="pr-6 pt-6">
          <Sidebar />
        </div>
        <div className="pl-6">
          <PackageList />
        </div>
      </div>
      <div className="md:hidden">
        <ToggleMenu />
      </div>
    </PackageProvider>
  );
}

function ToggleMenu() {
  const [open, setOpen] = useState(false);
  const Icon = open ? XMarkIcon : Bars3Icon;

  return (
    <div className="relative mt-4 flex flex-col items-start">
      <button onClick={() => setOpen(!open)} className="z-20">
        <Icon className="h-8 w-8 text-gray-400" />
      </button>
      {open && (
        <div className="absolute -left-1 -top-1 z-10 border bg-white px-8 pt-10 shadow">
          <Sidebar />
        </div>
      )}
      <PackageList />
    </div>
  );
}
