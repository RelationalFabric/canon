````ts
/**
 * @document.title Functions and JSDoc Tutorial
 * @document.description Demonstrates defining functions with JSDoc and testing them.
 * @document.keywords function, jsdoc, tutorial
 * @document.difficulty intermediate
 */

/*
# Introduction
We’ll define functions with clear JSDoc and observe their behavior through test assertions.
*/

/*
# Function to add numbers
We'll define a simple add function and see the results.
*/

/**
 * # Adds two numbers together
 *
 * Demonstrates a function with full JSDoc annotations.
 *
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @returns {number} Sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b
}

if (import.meta.vitest) {
  it('3 + 4 should equal 7', () =>
    expect(add(3, 4)).toBe(7))
}

/*
# Function to multiply numbers
A slightly more complex function; we’ll test it and observe the output.
*/

/**
 * # Multiplies two numbers together
 *
 * Demonstrates multiplication.
 *
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @returns {number} Product of a and b
 */
export function multiply(a: number, b: number): number {
  return a * b
}

if (import.meta.vitest) {
  it('2 * 5 should equal 10', () =>
    expect(multiply(2, 5)).toBe(10))
}
````
