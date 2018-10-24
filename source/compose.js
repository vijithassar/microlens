const compose = lenses => {
  const are_functions = lenses.every(item => typeof item === 'function')
  const is_array = Array.isArray(lenses)
  if (! is_array || ! are_functions) {
    console.error('input to lens composition helper function must be an array of lens functions')
    return
  } else {
    const composition = lenses.reduce((previous, current) => {
      const fn = function(structure, value) {
        if (arguments.length === 1) {
          return current(previous(structure))
        } else if (arguments.length === 2) {
          current(previous(structure), value)
          return structure
        }
      }
      return fn
    })
    return composition
  }
}

export { compose }
