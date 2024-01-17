import { Fragment } from "react";
import Image from "next/image";
import { Switch } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Filters } from "@/app/_components/api";
import { defaultParams, usePackageContext } from "./PackageContext";
import Spinner from "./Spinner";
import OwnersControl from "./OwnersControl";

export default function Sidebar() {
  const { navigate, status } = usePackageContext();

  return (
    <form
      action={() => navigate({})}
      className="flex w-[10rem] flex-shrink-0 flex-col items-end gap-2"
    >
      <SearchBar />
      <OwnersControl />
      <Sort />
      <Spacer />
      <CheckBox title="Windows" icon="/icons/win.svg" filter={Filters.Windows} />
      <CheckBox title="Mac" icon="/icons/mac.svg" filter={Filters.Mac} />
      <Spacer />
      <CheckBox title="Rhino 6" icon="/icons/rhino6.png" filter={Filters.Rhino6} />
      <CheckBox title="Rhino 7" icon="/icons/rhino7.png" filter={Filters.Rhino7} />
      <CheckBox title="Rhino 8" icon="/icons/rhino8.png" filter={Filters.Rhino8} />
      <Spacer />
      <CheckBox title="Rhino plugin" icon="/icons/rhp.png" filter={Filters.Rhino} />
      <CheckBox title="Grasshopper" icon="/icons/gha.png" filter={Filters.Grasshopper} />
      <button
        type="button"
        onClick={() => navigate(defaultParams)}
        className="mt-6 flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 active:bg-gray-200"
      >
        Reset filters
      </button>
      <div className="mt-6 flex min-h-[2.5rem] min-w-[2.5rem] flex-col items-center self-center">
        {status.isLoading && <Spinner />}
        {status.isError && <p className="text-center text-red-500">{status.message}</p>}
      </div>
    </form>
  );
}

function Spacer() {
  return <hr className="my-4 h-px w-full bg-gray-200" />;
}

interface CheckProps {
  title: string;
  icon: string;
  filter: Filters;
}

function CheckBox({ title, icon, filter }: CheckProps) {
  const { navigateFilter, controls } = usePackageContext();

  const has = (constant: Filters) => {
    return constant === (controls.filters & constant);
  };

  return (
    <Switch.Group as="div" className="flex">
      <Switch.Label as="label" className="flex w-28 items-center gap-1">
        <Image
          className="inline h-[1.2rem] w-[1.2rem]"
          src={icon}
          width={32}
          height={32}
          alt={title}
        />
        <span className="text-right text-sm text-gray-900">{title}</span>
      </Switch.Label>
      <Switch
        as={Fragment}
        checked={has(filter)}
        onChange={(checked) => navigateFilter(filter, checked)}
      >
        {({ checked }) => (
          <button
            type="button"
            className={`${
              checked ? "bg-gray-900" : "bg-gray-200"
            } relative inline-flex h-5 w-11 cursor-pointer rounded-full border-[0.125rem] border-transparent transition-colors duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2`}
          >
            <span
              aria-hidden="true"
              className={`${
                checked ? "translate-x-6" : "translate-x-0"
              } pointer-events-none absolute inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-100 ease-in-out`}
            />
          </button>
        )}
      </Switch>
    </Switch.Group>
  );
}

function SearchBar() {
  const { controls, setSearch } = usePackageContext();

  return (
    <div className="flex rounded-md">
      <input
        type="text"
        value={controls.search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-l-md border-0 px-3 py-1.5 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-400"
      />
      <button
        type="submit"
        className="relative -ml-px rounded-r-md px-3 ring-1 ring-inset ring-gray-300 hover:bg-gray-100"
      >
        <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
      </button>
    </div>
  );
}

function Sort() {
  const { navigate, controls } = usePackageContext();

  return (
    <div className="flex w-full flex-col">
      <select
        className=" rounded-md border-0 py-1.5 pl-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-400"
        value={controls.sort}
        onChange={(e) => navigate({ sort: Number(e.target.value) })}
      >
        <option value={0}>Downloads</option>
        <option value={1}>Last updated</option>
      </select>
    </div>
  );
}
