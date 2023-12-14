import { useEffect, useState } from "react";

export const pageResults = 25;

export interface Package {
  id: string;
  version: number;
  updated: string;
  authors: string;
  downloads: number;
  iconUrl: string;
  description: string;
  keywords: string;
  prerelease: boolean;
  homepageUrl?: string;
  filters: Filters;
  owners: Owner[];
}

export enum Filters {
  None = 0,
  Windows = 1,
  Mac = 2,
  Rhino = 4,
  Grasshopper = 8,
  Rhino6 = 16,
  Rhino7 = 32,
  Rhino8 = 64,
}

export interface Owner {
  id: number;
  name: string;
}

export class Status {
  message: "loading" | "idle" | string;

  constructor(message: string) {
    this.message = message;
  }

  public static loading() {
    return new Status("loading");
  }

  public static idle() {
    return new Status("idle");
  }

  public get isLoading() {
    return this.message === "loading";
  }

  public get isIdle() {
    return this.message === "idle";
  }

  public get isError() {
    return !this.isIdle && !this.isLoading;
  }
}

export function has(constant: Filters, pkg: Package) {
  return constant === (pkg.filters & constant);
}

export function useApi() {
  const [cache, setCache] = useState<Package[]>([]);
  const [status, setStatus] = useState<Status>(Status.idle());

  useEffect(() => {
    (async () => {
      setStatus(Status.loading());
      try {
        const url = "https://rhinopackages.blob.core.windows.net/packages/data.json";
        const response = await fetch(url);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || response.statusText);
        }
        const data = (await response.json()) as Package[];
        setCache(data);
        setStatus(Status.idle());
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setStatus(new Status(message));
      }
    })();
  }, []);

  return { cache, status };
}
