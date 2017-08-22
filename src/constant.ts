import { FluentValidator } from './fluent-validator'
import { invalid, valid } from './common'

export const Constant = <T>(constant: T) => {
  const name = `Constant(${constant})`
  return new FluentValidator<T>(
    name,
    async (value: any) => {
      if (value !== constant) {
        return invalid({
          type: 'constant',
          name,
          expected: constant,
          actual: value,
        })
      }
      return valid(value)
    })
}