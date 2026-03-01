import { Switch } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'

export function SwitchWithThumb({
  label,
  checked,
  onChanged,
  disabled,
}: {
  label: string
  checked: boolean
  onChanged: (event: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}) {
  return (
    <Switch
      checked={checked}
      onChange={(event) => onChanged(event)}
      color="teal"
      size="md"
      label={label}
      disabled={disabled}
      thumbIcon={
        checked ? (
          <IconCheck size={12} color="var(--mantine-color-teal-6)" stroke={3} />
        ) : (
          <IconX size={12} color="var(--mantine-color-red-6)" stroke={3} />
        )
      }
    />
  )
}
