````ts
/**
 * @document.title Demonstrating Header-Level Controls and Includes
 * @document.description Shows how to combine // #+, // #-, and // #! markers with file includes.
 * @document.keywords includes, markdown, tutorial, jsdoc
 * @document.difficulty intermediate
 */

/*
# Starting at the top level

We begin at the document’s root. This is our base heading level.
*/

console.log('Root section logic')

// @include ./supporting/root-helper.ts

/*
## Moving into a nested section

We’ll now demonstrate how to go *one level deeper* before including the next file.
*/

// #+
console.log('Entering nested section')

// @include ./supporting/deep-helper.ts

/*
## Still nested, but want to include something at same level

No header adjustment this time — we stay at the current depth.
*/

console.log('At the same nested depth')

// @include ./supporting/parallel-helper.ts

/*
## Now going back up

We’ll move back one level (from H3 → H2) before the next include.
*/

// #-
console.log('Climbing back up after deep section')

// @include ./supporting/summary-helper.ts

/*
### Finally, restart at the document base

Here we reset the header level back to the document’s base — for example, when adding appendices.
*/

// #!
console.log('Global conclusion')

// @include ./supporting/final-helper.ts
````
