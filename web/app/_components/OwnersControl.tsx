import { useMemo, useState } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import { Owner } from "./api";
import { usePackageContext } from "./PackageContext";

export default function OwnersControl() {
  const { controls, owners, navigate } = usePackageContext();
  const [filteredOwners, setFilteredOwners] = useState(owners);

  const selected = useMemo(() => {
    const all = { id: -1, name: "" };
    if (!controls.owner) return all;
    return owners.find((owner) => owner.id === controls.owner) ?? all;
  }, [controls.owner, owners]);

  return (
    <Combobox as="div" value={selected} onChange={(selected) => navigate({ owner: selected.id })}>
      <div className="relative">
        <Combobox.Input
          className="w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-400"
          displayValue={(person: Owner) => person.name}
          onFocus={() => setFilteredOwners(owners)}
          onChange={(event) => {
            const query = event.target.value;
            if (!query && controls.owner !== undefined) navigate({ owner: undefined });
            const filtered = owners.filter((owner) =>
              owner.name.toLowerCase().includes(query.toLowerCase()),
            );
            setFilteredOwners(filtered);
          }}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
        </Combobox.Button>

        {filteredOwners.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black ring-opacity-5">
            {filteredOwners.map((person) => (
              <Combobox.Option
                key={person.id}
                value={person}
                className={({ selected, active }) =>
                  `truncate py-2 pl-3
                    ${active ? "bg-gray-400 text-white" : "text-gray-900"}
                    ${selected ? "font-semibold" : "font-normal"}`
                }
              >
                {person.name}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}
