````ts
/**
 * @document.title Array Mapping Tutorial
 * @document.description Demonstrates mapping an array of numbers and observing transformations.
 * @document.keywords array, map, tutorial
 * @document.difficulty introductory
 */

/*
# Introduction
We'll explore array transformations together, using peer-first discovery to see the effects of map.
*/

const numbers = [1, 2, 3, 4]

/*
# Doubling numbers
Let's double each number. Peer mode: let's see what happens.
*/
const doubled = numbers.map(n => n * 2)

if (import.meta.vitest) {
  it('The first element after doubling should be 2', () =>
    expect(doubled[0]).toBe(2),)

  it('All elements should be doubled', () =>
    expect(doubled).toEqual([2, 4, 6, 8]),)
}

/*
# Filtering numbers
Now, let's see how to filter numbers greater than 4.
*/
const filtered = doubled.filter(n => n > 4)

if (import.meta.vitest) {
  it('Filtered array contains numbers greater than 4', () =>
    expect(filtered).toEqual([6, 8]),)
}
````
