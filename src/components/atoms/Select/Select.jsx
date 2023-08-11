import { Children, cloneElement, useState } from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { isArray } from "lodash";
import cn from "classnames";

import { QuestionTooltip } from "@/components/molecules";

const Select = ({ label, placeholder, children, value, onChange, className = "", labelDescription, disabled = false }) => {
  const [query, setQuery] = useState("");

  const filteredChildren =
    query === "" || Children.toArray(children).find((c) => c.props.children.toLowerCase() === query.toLowerCase())
      ? children
      : children.filter((item) => {
        return item.props.children.toLowerCase().includes(query.toLowerCase());
      });

  return (
    <Combobox as="div" disabled={disabled} className={className} value={value} onChange={(v) => {
      onChange(v);
      const child = Children.toArray(children).find((c) => c.props.value.toLowerCase() === value.toLowerCase());
      setQuery(child.props.children);
    }}>
      {label !== undefined && (
        <Combobox.Label className="block text-sm font-medium leading-none text-white/60">
          <div className="block mb-1 text-sm font-medium leading-none text-white/60">
            {label}{" "}
            {labelDescription && (
              <QuestionTooltip
                description={<span>{labelDescription}</span>}
              />
            )}
          </div>
        </Combobox.Label>
      )}
      <div className="relative mt-2">
        <Combobox.Input
          className={cn("block border w-full h-[45px] rounded-lg border-primary/20 bg-primary/10 text-white px-4 text-md font-normal focus:outline-none focus:ring-1 focus:border-primary/30 focus:ring-primary/30", {"text-white/50 cursor-not-allowed" : disabled})}
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(asset) => (isArray(children) ? children.find((item) => item.props?.value === asset)?.props?.children : children?.props?.children)}
          placeholder={placeholder}
          autoComplete="off"
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2 rounded-r-lg focus:outline-none">
          <ChevronUpDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        <Combobox.Options className="absolute z-20 w-full py-1 mt-1 overflow-auto text-base text-white rounded-lg shadow-lg bg-[#071327] max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-md">
          {filteredChildren.length > 0 ? (
            Children.toArray(filteredChildren).map((item, i) => cloneElement(item))
          ) : (
            <span className="py-2 pl-3 mb-1 text-white/60 pr-9 text-md">No value</span>
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  );
};

const Option = ({ value, children, disabled = false }) => (
  <Combobox.Option
    value={value}
    disabled={disabled}
    className={({ active, selected }) =>
      cn(
        "relative cursor-pointer select-none py-2 pl-3 pr-9",
        { "bg-primary/20 text-white": active },
        { "bg-primary/10 text-white": !active && selected },
        { "text-gray-white/20": !active && !selected && disabled },
        { "text-gray-white": !active && !selected && !disabled }
      )
    }
  >
    {({ active, selected }) => (
      <>
        <span className={cn("block truncate", { "font-semibold": selected })}>{children}</span>

        {selected && (
          <span
            className={cn("absolute inset-y-0 right-0 flex items-center pr-4", { "text-white": active || selected }, { "text-primary": !active && !selected })}
          >
            <CheckIcon className="w-5 h-5" aria-hidden="true" />
          </span>
        )}
      </>
    )}
  </Combobox.Option>
);

Select.Option = Option;

export default Select;
