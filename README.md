# Verus - Object schema validator

TypeScript is cool, but its typesystem can't protect against invalid external data, like REST-API responses.
You can write validators, but to get the benefits of static typing you would have to also write interface definitions.

Verus is a TypeScript (and Javascript) library that can do both at the same time!

Example:

```typescript
import { String, Shape, ISODate, ArrayOf, typeValue } from 'verus'

// typeof User = { name: string, birthdate: Date, employment: 'employee'|'worker'|'self-employed', email: string, kids: string[] }
export class User extends Shape({
    name: String,
    birthdate: ISODate,
    email: String,
    employment: Union('employee', 'worker', 'self-employed')
    kids: ArrayOf(String)
}) {}

const userJson = {
    name: 'Joan Smith',
    birthdate: '1986-11-05T14:30-02:00',
    email: 'joan.smith@protonmail.ch',
    employment: 'employee'
    kids: ['Jack', 'Jill']
}

const validation = User.validate(userJson)
if (validation.result === 'valid') {
    doStuffWithUser(validation.value)
}
```

