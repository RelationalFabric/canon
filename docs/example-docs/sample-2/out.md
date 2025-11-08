# Functions and JSDoc Tutorial

Demonstrates defining functions with JSDoc and testing them.

## Introduction
We’ll define functions with clear JSDoc and observe their behavior through test assertions.

## Adds two numbers together
Demonstrates a function with full JSDoc annotations.

```ts
export function add(a: number, b: number): number {
  return a + b
}
```

| Parameter | Type   | Description      |
|-----------|--------|-----------------|
| a         | number | First operand |
| b         | number | Second operand |

Returns: `number` — Sum of a and b

3 + 4 should equal 7:

```ts
expect(add(3, 4)).toBe(7)
```

Status: ✅ pass

## Multiplies two numbers together
Demonstrates multiplication.

```ts
export function multiply(a: number, b: number): number {
  return a * b
}
```

| Parameter | Type   | Description      |
|-----------|--------|-----------------|
| a         | number | First operand |
| b         | number | Second operand |

Returns: `number` — Product of a and b

2 * 5 should equal 10:

```ts
expect(multiply(2, 5)).toBe(10)
```

Status: ✅ pass
