# Demonstrating Header-Level Controls and Includes

Shows how to combine // #+, // #-, and // #! markers with file includes.

# Starting at the top level

We begin at the document’s root. This is our base heading level.

```ts
console.log('Root section logic')
```

--

## Root Heloers (`supporting/root-helper.ts`)

```ts
// …placeholder content…
```

--

## Moving into a nested section

We’ll now demonstrate how to go *one level deeper* before including the next file.

```ts
console.log('Entering nested section')
```

--

### Deep Helpers (`supporting/deep-helper.ts`)

```ts
// …placeholder content…
```

--

## Still nested, but want to include something at same level

No header adjustment this time — we stay at the current depth.

```ts
console.log('At the same nested depth')
```

--

### Some other title (`supporting/parallel-helper.ts`)

```ts
// …placeholder content…
```

--

## Now going back up

We’ll move back one level (from H3 → H2) before the next include.

```ts
console.log('Climbing back up after deep section')
```

--

## Supporting File (`supporting/summary-helper.ts`)

```ts
// …placeholder content…
```

--

### Finally, restart at the document base

Here we reset the header level back to the document’s base — for example, when adding appendices.

```ts
console.log('Global conclusion')
```

--

# Supporting File (`supporting/final-helper.ts`)

```ts
// …placeholder content…
```

--
