# Array Mapping Tutorial

Demonstrates mapping an array of numbers and observing transformations.

## Introduction
We'll explore array transformations together, using peer-first discovery to see the effects of map.

## Doubling numbers
Let's double each number. Peer mode: let's see what happens.

```ts
const doubled = numbers.map(n => n * 2)
```

The first element after doubling should be 2:

```ts
expect(doubled[0]).toBe(2)
```

Status: ✅ pass

All elements should be doubled:

```ts
expect(doubled).toEqual([2, 4, 6, 8])
```

Status: ✅ pass

## Filtering numbers
Now, let's see how to filter numbers greater than 4.

```ts
const filtered = doubled.filter(n => n > 4)
```

Filtered array contains numbers greater than 4:

```ts
expect(filtered).toEqual([6, 8])
```

Status: ✅ pass
