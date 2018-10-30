// create a function that takes an array of lenses and composes them
const compose = lenses => {
  // first, validate the inputs:
  // the input argument must be an array
  const is_array = Array.isArray(lenses)
  // every item in the array must be a function, which is assumed to be a lens
  const are_functions = lenses.every(item => typeof item === 'function')
  // bail if any of the input conditions are not met
  if (! is_array || ! are_functions) {
    console.error('input to lens composition helper function must be an array of lens functions')
    return
  } else {
    // iterate across the array of lenses
    const composition = lenses.reduce((previous, current) => {
      // each iteration of the reducer returns a function
      // with the same parameter signature as a lens
      const fn = function(structure, value) {
        // if the value input is not supplied
        if (arguments.length === 1) {
          // run the current function and all previously
          // composed functions as a getter
          return current(previous(structure))
        // if the value input is supplied
        } else if (arguments.length === 2) {
          // set the value
          current(previous(structure), value)
          // get and then immediately set the value of the
          // previous composition so the set operation will
          // trigger the immutability function if one has
          // been set, then return the previous structure
          return previous(structure, previous(structure))
        }
      }
      // return the new wrapper function from the reducer
      return fn
    })
    // return the composition, which will be the wrapper
    // function created by the final iteration of the
    // reducer
    return composition
  }
}

export { compose }
