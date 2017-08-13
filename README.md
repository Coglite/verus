# Verus - Object schema validator

TypeScript is cool, but its typesystem can't protect against invalid external data, like REST-API responses.
You can write validators, but to get the benefits of static typing you would have to also write interface definitions.

Verus is a TypeScript (and Javascript) library that can do both at the same time!

Example:

```typescript
import { String, Shape, ISODate, ArrayOf, typeValue } from 'verus'

export const User = Shape({
    name: String,
    birthdate: ISODate,
    email: String,
    kids: ArrayOf(String)
})

// typeof only works with values currently, so we cheat by
// using this helper function to get a value with the type of the validator.
// Actual runtime value is undefined, so never export or use this!
const userTypeValue = typeValue(User)

// And now we can get the type of the value
export type User = typeof userTypeValue
// type User = { name: string, birthdate: Date, email: string, kids: string[] }

// Using the validator is simple:
const userJson = {
    name: 'Joan Smith',
    birthdate: '1986-11-05T14:30-02:00',
    email: 'joan.smith@protonmail.ch',
    kids: ['Jack', 'Jill']
}

const validation = User.validate(userJson)
if (validation.result === 'valid') {
    doStuffWithUser(validation.value)
}
```

