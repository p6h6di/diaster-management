"use client";

import { useEffect, useState } from "react";
import { Report, ReportStatus, ReportType } from "@prisma/client";
import SignoutButton from "@/components/logout-btn";
import { authClient } from "@/lib/auth-client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<ReportStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<ReportType | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const session = authClient.useSession();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/reports");
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportStatus = async (
    reportId: string,
    newStatus: ReportStatus
  ) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const filteredReports = reports.filter((report) => {
    const statusMatch = filter === "ALL" || report.status === filter;
    const typeMatch = typeFilter === "ALL" || report.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const getStatusColor = (status: ReportStatus) => {
    const colors = {
      PENDING: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      IN_PROGRESS: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
      RESOLVED: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
      DISMISSED:
        "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20",
    };
    return colors[status];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <nav className="border-b border-neutral-800 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto  px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium">
              Hello, {session.data?.user.name || "Admin"} 👋
            </h1>
            <div>
              <SignoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <Select
              value={filter}
              onValueChange={(value) =>
                setFilter(value as ReportStatus | "ALL")
              }
            >
              <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 text-neutral-300 focus:ring-blue-500/20 focus:border-blue-500/20">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-300">
                <SelectGroup>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {Object.values(ReportStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as ReportType | "ALL")
              }
            >
              <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 text-neutral-300 focus:ring-blue-500/20 focus:border-blue-500/20">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-300">
                <SelectGroup>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {Object.values(ReportType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="text-neutral-400">
            {filteredReports.length} Reports
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-800 hover:border-neutral-700 transition-all"
            >
              <div className="flex justify-between items-start gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-medium text-neutral-200">
                      {report.title}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className="text-neutral-400 text-sm">
                    {report.description}
                  </p>
                  <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
                      </div>
                      {report.type}
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
                      </div>
                      {report.location || "N/A"}
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
                      </div>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {report.image && (
                    <img
                      src={report.image}
                      alt="Report"
                      className="mt-4 max-h-96 w-full h-96 rounded-lg border border-neutral-800"
                    />
                  )}
                </div>
                <Select
                  value={report.status}
                  onValueChange={(value) =>
                    updateReportStatus(report.id, value as ReportStatus)
                  }
                >
                  <SelectTrigger className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 text-neutral-300 border border-neutral-800">
                    {Object.values(ReportStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="text-center py-12 text-neutral-500 bg-neutral-900/50 rounded-xl border border-neutral-800">
              No reports found matching the selected filters.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
