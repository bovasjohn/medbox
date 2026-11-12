import { useId } from 'react'
import { Input } from './Field'

// A normal text box that also offers previously used values as suggestions.
// You can pick one, or just type something new.
export default function SuggestInput({ options = [], ...props }) {
  const id = useId()
  return (
    <>
      <Input list={options.length ? id : undefined} autoComplete="off" {...props} />
      {options.length > 0 && (
        <datalist id={id}>
          {options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      )}
    </>
  )
}
