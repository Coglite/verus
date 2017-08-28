import { FluentValidator } from './fluent-validator'
import { invalid, valid } from './common'

export function Union<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string,
  H extends string,
  I extends string,
  J extends string,
  K extends string
>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H,
  i: I,
  j: J,
  k: K
): FluentValidator<A | B | C | D | E | F | G | H | I | J | K>
export function Union<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string,
  H extends string,
  I extends string,
  J extends string
>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H,
  i: I,
  j: J
): FluentValidator<A | B | C | D | E | F | G | H | I | J>
export function Union<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string,
  H extends string,
  I extends string
>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H,
  i: I
): FluentValidator<A | B | C | D | E | F | G | H | I>
export function Union<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string,
  H extends string
>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H
): FluentValidator<A | B | C | D | E | F | G | H>
export function Union<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string,
  G extends string
>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G
): FluentValidator<A | B | C | D | E | F | G>
export function Union<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string,
  F extends string
>(a: A, b: B, c: C, d: D, e: E, f: F): FluentValidator<A | B | C | D | E | F>
export function Union<
  A extends string,
  B extends string,
  C extends string,
  D extends string,
  E extends string
>(a: A, b: B, c: C, d: D, e: E): FluentValidator<A | B | C | D | E>
export function Union<
  A extends string,
  B extends string,
  C extends string,
  D extends string
>(a: A, b: B, c: C, d: D): FluentValidator<A | B | C | D>
export function Union<A extends string, B extends string, C extends string>(
  a: A,
  b: B,
  c: C
): FluentValidator<A | B | C>
export function Union<A extends string, B extends string>(
  a: A,
  b: B
): FluentValidator<A | B>
export function Union(...values: string[]) {
  const name = `Union(${values.join('|')})`
  return new FluentValidator<any>(name, async value => {
    if (values.indexOf(value) === -1) {
      return invalid({
        type: 'union',
        name,
      })
    }
    return valid(value)
  })
}
