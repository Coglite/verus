import { FluentValidator } from './fluent-validator'
import { String } from './type'
import { invalid, Valid, valid } from './common'
import { ParseError } from './errors'

const name = 'Email'
const invalidEmail = Promise.resolve(
  invalid<ParseError>({ type: 'parse', name, expectedFormat: 'email' })
)

export const Email = String.and(
  new FluentValidator<string>('Email', value => {
    if ((value as string).indexOf('@') === -1) {
      return invalidEmail
    }
    return Promise.resolve<Valid<string>>(valid(value))
  })
)
