"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ORDERS } from "@/features/admin/lib/mock-data";
import FulfillmentBadge from "@/features/admin/components/FulfillmentBadge";

// *TODO: pagination — wire to real pagination logic when API is ready
const ITEMS_PER_PAGE = 4;

const FILTER_TABS = [
  { label: "Action Required", shortLabel: "Required", count: 12 },
  { label: "Pending Verification", shortLabel: "Pending", count: 0 },
  { label: "In Transit", shortLabel: "Transit", count: 0 },
  { label: "Archived", shortLabel: "Archived", count: 0 },
] as const;

const TABLE_HEADERS = [
  { label: "Order ID", key: "id" },
  { label: "Client", key: "client" },
  { label: "Value", key: "value" },
  { label: "COD Status", key: "cod_status" },
  { label: "Action", key: "action" },
] as const;

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  // *TODO: server-side filter when API is ready — currently client-side
  const filteredOrders = useMemo(
    () =>
      ORDERS.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          o.customerName.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  // *TODO: pagination — slice data based on current page
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="flex flex-col gap-12">
      {/* Page Header */}
      <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-3xl tracking-widest">
            Order Manager
          </h1>
        </div>
        <Field
          className="border-primary bg-accent w-80 border-b p-2"
          orientation="horizontal"
        >
          <Input
            className="focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={search}
            placeholder="Search by ID or customer..."
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search />
        </Field>
      </header>

      {/* Tabs and filter */}
      {/* *TODO: mobile tabs — horizontal scroll + condensed labels on small screens */}
      <Tabs data-orientation="horizontal" defaultValue="action-required">
        <TabsList variant="line">
          {FILTER_TABS.map((tab) => (
            <TabsTrigger
              key={tab.label}
              className="min-w-fit text-sm whitespace-nowrap md:text-base"
              value={tab.label.toLowerCase().replace(/\s+/g, "-")}
            >
              {/* *TODO: mobile shows short label, desktop shows full label */}
              <span className="md:hidden">{tab.shortLabel}</span>
              <span className="hidden md:inline">{tab.label}</span>
              {/* *TODO: show count on both mobile and desktop */}
              {"count" in tab && tab.count > 0 && (
                <span className="text-muted-foreground ml-1.5">
                  ({tab.count})
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="border-border bg-card flex-1 overflow-hidden border transition-shadow duration-500 hover:shadow-[0px_12px_32px_rgba(26,26,26,0.04)]">
        <Table className="min-w-3xl">
          <TableHeader>
            <TableRow>
              {TABLE_HEADERS.map((header) => (
                <TableHead key={header.label}>
                  {header.label.toUpperCase()}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="text-base">
            {paginatedOrders.map((order) => {
              const isError = order.isError;
              return (
                <TableRow
                  key={order.orderNumber}
                  className={
                    isError
                      ? "bg-destructive/10 hover:bg-destructive/20"
                      : "hover:bg-muted"
                  }
                >
                  <TableCell className="font-heading text-foreground py-8 text-lg">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell className="py-8">
                    <div className="text-foreground font-medium">
                      {order.customerName}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs font-semibold tracking-widest">
                      {order.customerEmail}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground py-8 tracking-wide">
                    ৳{" "}
                    {order.totalAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="py-8">
                    <FulfillmentBadge status={order.status} />
                  </TableCell>
                  <TableCell className="py-8 text-left">
                    <Link href={`/admin/orders/${order.orderNumber}`}>
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer rounded-none bg-transparent text-sm tracking-wider uppercase"
                      >
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* pagination footer  */}
      <div className="mt-8 flex items-center justify-between py-4">
        <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Showing {paginatedOrders.length} of {filteredOrders.length} Actionable
          Items
        </span>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground"
            disabled={currentPage * ITEMS_PER_PAGE >= filteredOrders.length}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
