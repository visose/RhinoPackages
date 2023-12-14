"use client";

import { Filters, Package, has, useApi } from "@/app/_components/api";
import { useMemo } from "react";

export default function Page() {
  const { cache } = useApi();
  const stats = useMemo(() => getStats(cache), [cache]);

  return (
    <dl className="flex flex-col divide-y divide-gray-100">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="grid grid-cols-2 gap-4 py-2">
          <dt className="text-right text-sm font-medium text-gray-900">{key}</dt>
          <dd className="text-sm text-gray-700">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function getStats(cache: Package[]): Record<string, string> {
  function count(filter: Filters) {
    const count = cache.filter((pkg) => has(filter, pkg)).length;
    return count.toLocaleString();
  }

  if (cache.length === 0) return {};

  let lastUpdated = cache.reduce((prev, curr) =>
    prev.updated > curr.updated ? prev : curr,
  ).updated;
  lastUpdated = new Date(lastUpdated).toLocaleString();

  return {
    "Last updated": lastUpdated,
    "Number of packages": cache.length.toLocaleString(),
    "Grasshopper plugins": count(Filters.Grasshopper),
    "Rhino plugins": count(Filters.Rhino),
  };
}
