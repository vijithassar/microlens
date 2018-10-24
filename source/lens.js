const noop = _ => _

const lens = ([...args], immutable = noop) => {
  const get = structure => {
    if (typeof structure === 'undefined') {
      throw new Error('get function requires structure as first argument')
    }
    try {
      return args.reduce((previous, current) => {
        return previous[current]
      }, structure)
    } catch (error) {
      console.error(error)
      return
    }
  }
  const set = (structure, value) => {
    if (typeof structure === 'undefined') {
      console.error('set function requires structure as first argument')
      return
    }
    if (typeof value === 'undefined') {
      console.error('set function requires value as second argument')
      return
    }
    let current = structure
    let keys = args.slice().reverse()
    try {
      while (keys.length > 0) {
        let key = keys.pop()
        let integer = Number.isInteger(key)
        let last = keys.length === 0
        if (! current[key]) {
          if (integer) {
            current[key] = []
          } else {
            current[key] = {}
          }
        }
        if (last) {
          current[key] = value
          return structure
        } else {
          current = current[key]
        }
      }
    } catch (error) {
      console.error('could not find expected key while traversing input data structure')
      console.error(error)
      return
    }
  }
  const fn = function(structure, value) {
    const value_provided = typeof value !== 'undefined'
    if (! value_provided) {
      return get(structure)
    } else if (value_provided) {
      return immutable(set(structure, value))
    }
  }
  return fn
}

export { lens }
