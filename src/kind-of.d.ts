type KindOf =
        'undefined'
    | 'null'
    | 'boolean'
    | 'buffer'
    | 'number'
    | 'string'
    | 'arguments'
    | 'object'
    | 'date'
    | 'array'
    | 'regexp'
    | 'function'
    | 'generatorfunction'
    | 'promise'
    | 'map'
    | 'weakmap'
    | 'set'
    | 'symbol'
    | 'int8array'
    | 'uint8array'
    | 'uint8clampedarray'
    | 'int16array'
    | 'uint16array'
    | 'int32array'
    | 'uint32array'
    | 'float32array'
    | 'float64array'


declare module 'kind-of' {
    const kindOf: (value: any) => KindOf
    export = kindOf
}