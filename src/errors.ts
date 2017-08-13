export type Errors =
    AndError
    | OrError
    | ShapeErrors
    | TypeError
    | ArrayErrors
    | ParseError

export interface AndError {
    type: 'and'
    name: string
    right?: Errors
    left?: Errors
}

export interface OrError {
    type: 'or'
    name: string
    right?: Errors
    left?: Errors
}

export interface ShapeErrors {
    type: 'shape'
    name: string
    shapeName: string
    fields: { [key: string]: Errors }
    extra?: { [key: string]: string }
}

export interface TypeError {
    type: 'type'
    name: string
    expected: string
    actual: string
}

export interface ArrayErrors {
    type: 'array'
    name: string
    invalidIndices: [number, Errors][]
}

export interface ParseError {
    type: 'parse'
    name: string
    expectedFormat: string
}

export function errorMessage(errors: Errors): string {
    return joinLines(buildErrorMessage([], errors))
}

function joinLines(iter: IterableIterator<string>): string {
    let l
    let s = ''
    while (!(l = iter.next()).done) {
        s += l.value + '\n'
    }
    return s
}

function* buildErrorMessage(path: string[], errors: Errors): IterableIterator<string> {
    const p = path.length > 0 ? path.join('') : 'value'
    switch (errors.type) {
        case 'type':
            return yield `${p} is the wrong type, expected ${errors.expected}, got ${errors.actual}`
        case 'parse':
            return yield `${p} did not match '${errors.expectedFormat}'-format`
        case 'and':
            if (errors.left) {
                return yield `${p} failed ${errors.name} validator left side`
            } else {
                return yield `${p} failed ${errors.name} validator right side`
            }
        case 'or':
            return yield `${p} failed all validators: ${errors.name}`
        case 'shape':
            for (const key of Object.keys(errors.fields)) {
                const err = errors.fields[key]
                const p = path.length > 0 ? path.concat(['.', key]) : [errors.shapeName, '.', key]
                yield* iterableToArray(buildErrorMessage(p, err))
            }
            if (errors.extra) {
                for (const key of Object.keys(errors.extra)) {
                    const type = errors.extra[key]
                    const p = path.length > 0 ? path.concat(['.', key]) : [errors.shapeName, '.', key]
                    yield `${p.join('')} is an unexpected field with type ${type}`
                }
            }
            break
        case 'array':
            for (const [idx, error] of errors.invalidIndices) {
                yield* iterableToArray(buildErrorMessage(path.concat([`[${idx}]`]), error))
            }
            break
    }
}

function iterableToArray<T>(iter: IterableIterator<T>): T[] {
    let arr: T[] = []
    let item
    while (!((item = iter.next()).done)) {
        arr.push(item.value)
    }
    return arr
}
