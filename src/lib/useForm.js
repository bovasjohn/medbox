import { useState } from 'react'

// Tiny form helper: current values plus bind(name) -> { value, onChange }.
export function useForm(initial) {
  const [values, setValues] = useState(initial)
  const bind = (name) => ({
    value: values[name] ?? '',
    onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.value })),
  })
  return { values, setValues, bind }
}
