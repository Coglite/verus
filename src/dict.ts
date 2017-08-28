import { FluentValidator } from './fluent-validator'
import { Validator, invalid, valid } from './common'
import * as kindOf from 'kind-of'
import { DictError } from './errors'

export interface Dict<T> {
  [key: string]: T
}

export const Dict = <T>(validator: Validator<T>) => {
  const name = `Dict(${validator.name})`
  return new FluentValidator<Dict<T>>(name, async value => {
    const type = kindOf(value)
    if (type !== 'object') {
      return invalid({
        type: 'type',
        name,
        expected: 'object',
        actual: type,
      })
    }

    const keys = Object.keys(value)
    const values: { [key: string]: T } = {}
    const errors: DictError = {
      type: 'dict',
      name,
      fields: {},
    }
    let isValid = true

    for (const key of keys) {
      const r = await validator.validate(value[key])
      if (!r.valid) {
        isValid = false
        errors.fields[key] = r.errors
      }
      if (isValid && r.valid) {
        values[key] = r.value
      }
    }

    if (!isValid) {
      return invalid(errors)
    }
    return valid(values)
  })
}
