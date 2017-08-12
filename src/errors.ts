export type Errors =
      AndError
    | OrError
    | ShapeErrors
    | TypeError
    | ArrayErrors
    | ParseError

export interface AndError {
    type: 'and'
    right?: Errors
    left?: Errors
}

export interface OrError {
    type: 'or'
    right?: Errors
    left?: Errors
}

export interface ShapeErrors {
    type: 'shape'
    fields: {[key: string]: Errors}
    extra?: {[key: string]: string}
}

export interface TypeError {
    type: 'type'
    expected: string
    actual: string
}

export interface ArrayErrors {
    type: 'array'
    invalidIndices: [number, Errors][]
}

export interface ParseError {
    type: 'parse'
    expectedFormat: string
    value: string
}

