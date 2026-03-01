import { Combobox, InputBase, useCombobox, Loader } from '@mantine/core'
import { useState, useEffect } from 'react'

type Option = {
  label: string
  value: string
}

interface SearchableSelectProps {
  label?: string
  placeholder?: string
  data: Option[]
  value?: string | null
  onChange?: (value: string | null) => void
  error?: React.ReactNode
  isLoading?: boolean
}

export function SearchableSelect({
  label,
  placeholder,
  data = [],
  value,
  onChange,
  error,
  isLoading,
}: SearchableSelectProps) {
  const combobox = useCombobox({
    onDropdownClose: () => {
      // combobox.resetSelectedOption()
      // combobox.closeDropdown()
      // On close, reset the search input to match the currently selected value's label
      setSearch(selectedOption ? selectedOption.label : '')
    },
  })

  // Find the currently selected object based on the ID passed in via props

  const selectedOption = data.find((item) => item.value === value)

  // FIX: Depend on the *label string*, not the 'data' array reference.
  // Even if 'data' is a new array, if the found label is the same, this won't run.
  useEffect(() => {
    if (selectedOption) {
      setSearch(selectedOption.label)
    }
  }, [value, selectedOption?.label])

  // Local state for what the user is typing
  const [search, setSearch] = useState(
    selectedOption ? selectedOption.label : '',
  )

  // Sync search text if the value changes (e.g., form reset or initial load)
  useEffect(() => {
    setSearch(selectedOption ? selectedOption.label : '')
  }, [value, data])

  // Filter logic
  const filteredOptions = data.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase().trim()),
  )

  const options = filteredOptions.map((item) => (
    <Combobox.Option value={item.value} key={item.value}>
      {item.label}
    </Combobox.Option>
  ))

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        // 1. Update the parent (form) with the ID (val)
        onChange?.(val)
        // 2. Find the label for that ID to update the visual input
        const selected = data.find((i) => i.value === val)
        setSearch(selected ? selected.label : '')
        // 3. Close
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <InputBase
          label={label}
          rightSection={isLoading ? <Loader size={18} /> : <Combobox.Chevron />}
          value={search}
          onChange={(event) => {
            combobox.openDropdown()
            combobox.updateSelectedOptionIndex()
            setSearch(event.currentTarget.value)
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown()
            // If user leaves without selecting, revert text to the actual selected value
            setSearch(selectedOption ? selectedOption.label : '')
          }}
          placeholder={placeholder || 'Search...'}
          rightSectionPointerEvents="none"
          error={error}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>Nothing found</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
