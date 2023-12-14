import Image from "next/image";
import {
  ArrowDownTrayIcon,
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  CalendarIcon,
  StarIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { pageResults, Filters, Package } from "@/app/_components/api";
import { usePackageContext } from "./PackageContext";

export default function PackageList() {
  const { controls, packages, navigate } = usePackageContext();

  const disablePagination = packages.length === 0 || controls.page === 0 && packages.length !== pageResults;

  return (
    <div className="flex flex-col ">
      <ul role="list" className="flex flex-grow flex-col divide-y">
        {packages.map((pkg) => {
          return <PackageCard key={pkg.id} pkg={pkg} />;
        })}
      </ul>
      {!disablePagination && (
        <div className="mx-6 flex items-center justify-between">
          <button
            disabled={controls.page === 0}
            onClick={() => navigate({ page: controls.page - 1 })}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-25 disabled:hover:text-gray-500"
          >
            <ArrowLongLeftIcon className="mt-[0.1rem] h-5 w-5" aria-hidden="true" />
            Previous
          </button>
          <button
            disabled={packages.length !== pageResults}
            onClick={() => navigate({ page: controls.page + 1 })}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-25 disabled:hover:text-gray-500"
          >
            Next
            <ArrowLongRightIcon className="mt-[0.1rem] h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

function PackageCard({ pkg }: { pkg: Package }) {
  const { navigate } = usePackageContext();

  function has(constant: Filters) {
    return constant === (pkg.filters & constant);
  }

  let url = !pkg.homepageUrl ? "#" : pkg.homepageUrl;

  if (!url.startsWith("http")) {
    url = "//" + url;
  }

  const link = `rhino://package/search?name=${pkg.id}`;
  const tags = pkg.keywords ? pkg.keywords.split(",").map((tag) => tag.trim()) : undefined;
  const date = new Date(pkg.updated).toLocaleDateString();
  const downloads = pkg.downloads.toLocaleString();

  return (
    <li className="flex flex-col py-6">
      <div className="mb-4 flex flex-col md:flex-row">
        <div className="flex gap-x-4">
          <Image
            className="h-[2rem] w-[2rem]"
            src={pkg.iconUrl}
            width={32}
            height={32}
            alt="Package icon"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <a
                href={url}
                target="_blank"
                className="whitespace-nowrap text-sm font-semibold text-gray-900"
              >
                {pkg.id}
              </a>
              {pkg.prerelease && (
                <span className="rounded-full bg-yellow-50 px-1.5 py-1 text-[0.6rem] font-semibold leading-none text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                  wip
                </span>
              )}
              <p className="whitespace-nowrap text-xs font-normal text-gray-600">{pkg.version}</p>
            </div>
            <div className="flex items-center">
              <div className="flex flex-wrap items-center gap-x-1 whitespace-nowrap">
                <UserIcon className="h-3 w-3 text-gray-400" />
                {pkg.owners.map((owner, i) => (
                  <button
                    onClick={() => navigate({ owner: owner.id })}
                    key={owner.id}
                    className="text-xs text-gray-700 underline"
                  >
                    {owner.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-shrink-0 flex-grow justify-between md:w-auto md:justify-end">
          <div className="items-top mt-1 flex gap-4">
            <div className="flex gap-1">
              <Icon isEnabled={has(Filters.Windows)} src="/icons/win.svg" alt="Windows" />
              <Icon isEnabled={has(Filters.Mac)} src="/icons/mac.svg" alt="Mac" />
            </div>
            <div className="flex gap-1">
              <Icon isEnabled={has(Filters.Rhino6)} src="/icons/rhino6.png" alt="Rhino 6" />
              <Icon isEnabled={has(Filters.Rhino7)} src="/icons/rhino7.png" alt="Rhino 7" />
              <Icon isEnabled={has(Filters.Rhino8)} src="/icons/rhino8.png" alt="Rhino 8" />
            </div>
            <div className="flex gap-1">
              <Icon isEnabled={has(Filters.Rhino)} src="/icons/rhp.png" alt="Rhino plugin" />
              <Icon
                isEnabled={has(Filters.Grasshopper)}
                src="/icons/gha.png"
                alt="Grasshopper plugin"
              />
            </div>
          </div>
          <div className="ml-4 flex flex-col items-end">
            <div className="flex items-center gap-1">
              <StarIcon className="h-3 w-3 text-gray-400" />
              <p className="text-xs text-gray-600">{downloads}</p>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3 text-gray-400" />
              <p className="text-xs text-gray-600">{date}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-8">
        <p className="break-long-words flex-grow whitespace-pre-line text-xs text-gray-800">
          {pkg.description}
        </p>
        <a
          href={link}
          className="hidden items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 active:bg-gray-200 md:flex"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Install
        </a>
      </div>
      <div className="mt-4 flex flex-wrap place-items-center items-start gap-1">
        {tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
          >
            {tag}
          </span>
        ))}
      </div>
    </li>
  );
}

function Icon({ isEnabled, src, alt }: { isEnabled: boolean; src: string; alt: string }) {
  return (
    <Image
      className={"h-[1.2rem] w-[1.2rem]" + (isEnabled ? "" : " opacity-[0.1]")}
      src={src}
      width={32}
      height={32}
      alt={alt}
    />
  );
}
