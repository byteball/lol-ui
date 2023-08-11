import { Children, cloneElement, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

import cn from "classnames";

import { QuestionTooltip } from "@/components/molecules";

const Select = ({ label, placeholder, children, value, onChange, className = "", labelDescription, disabled = false }) => (
  <Listbox disabled={disabled} className={className} value={value} onChange={onChange}>
    {({ open }) => (
      <>
        {label !== undefined && (
          <Listbox.Label className="block text-sm font-medium leading-none text-white/60">
            <div className="block mb-1 text-sm font-medium leading-none text-white/60">
              {label}{" "}
              {labelDescription && (
                <QuestionTooltip
                  description={<span>{labelDescription}</span>}
                />
              )}
            </div>
          </Listbox.Label>
        )}

        <div className="relative mt-2">
          <Listbox.Button
            className={cn("block text-left border w-full h-[45px] rounded-lg border-primary/20 bg-primary/10 text-white px-4 text-md font-normal focus:outline-none focus:ring-1 focus:border-primary/30 focus:ring-primary/30", { "text-white/50 cursor-not-allowed": disabled })}
          >
            {children.find((item) => item.props?.value === value)?.props?.children || placeholder}
            
            <span className="absolute inset-y-0 right-0 z-0 flex items-center px-2 rounded-r-lg focus:outline-none">
              <ChevronUpDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-20 w-full py-1 mt-1 overflow-auto text-base text-white rounded-lg shadow-lg bg-[#071327] max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-md">
              {children.length > 0 ? (
                Children.toArray(children).map((item, i) => cloneElement(item))
              ) : (
                <span className="py-2 pl-3 mb-1 text-white/60 pr-9 text-md">No value</span>
              )}
            </Listbox.Options>
          </Transition>
        </div>

      </>)}
  </Listbox>
);

const Option = ({ value, children, disabled = false }) => (
  <Listbox.Option
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
      <div>
        <span className={cn("block truncate", { "font-semibold": selected })}>{children}</span>

        {selected ? (
          <span
            className={cn("absolute inset-y-0 right-0 flex items-center pr-4", { "text-white": active || selected }, { "text-primary": !active && !selected })}
          >
            <CheckIcon className="w-5 h-5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    )}
  </Listbox.Option>
);

Select.Option = Option;

export default Select;
