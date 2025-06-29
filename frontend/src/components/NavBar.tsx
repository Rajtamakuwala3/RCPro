'use client';

import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

function Navbar({ className }: { className?: string }) {
    const [active, setActive] = useState<string | null>(null);
  return (
    <div
    className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
        <Menu setActive={setActive}>
            <Link href={"/"}>
            <MenuItem setActive={setActive} active={active} item="Home">
            
            </MenuItem>
            </Link>

            <MenuItem
            setActive={setActive} active={active} item="Customer"
            >
               <div className="flex flex-col space-y-4 text-sm">
               <HoveredLink href="/customer/new-customer">Create New Customer</HoveredLink>
            <HoveredLink href="/customer/existing-customer">
              Use Existing Customer
            </HoveredLink>
               </div>
            </MenuItem>
            <MenuItem
            setActive={setActive} active={active} item="Filters"
            >
                <div className="flex flex-col space-y-4 text-sm">
                    <HoveredLink href="/filter/vehicleno">Fetch By Vehicle No</HoveredLink>
                    <HoveredLink href="/filter/fitness">Filter By Fitness Expiery Date</HoveredLink>
                    <HoveredLink href="/filter/insurance">Filter By Insurance Expiery Date</HoveredLink>
                    <HoveredLink href="/filter/cylinder">Filter By Cylinder Expiery Date</HoveredLink>
                </div>
            </MenuItem>
            <Link href={"/login"}>
            <MenuItem setActive={setActive} active={active} item="Login">
            </MenuItem>
            </Link>
        </Menu>
    </div>
  )
}

export default Navbar