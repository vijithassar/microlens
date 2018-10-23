const lens = ([...args]) => {
  const noop = _ => _
  let immutable = noop
  const get = structure => {
    return args.reduce((previous, current) => {
      return previous[current]
    }, structure)
  }
  const set = (structure, value) => {
    let current = structure
    let keys = args.slice().reverse()
    let key
    try {
      while (keys.length > 1) {
        key = keys.pop()
        current = current[key]
      }
    } catch (error) {
      console.error('could not find key ' + key)
      return false
    }
    if (keys.length === 1) {
      let key = keys.pop()
      try {
        current[key] = value
        return true
      } catch (error) {
        console.error('could not find key ' + key)
        return false
      }
    }
  }
  const fn = function(structure, value) {
    const value_provided = typeof value !== 'undefined'
    if (! value_provided) {
      return immutable(get(structure))
    } else if (value_provided) {
      return set(structure, value)
    }
  }
  const set_immutable = _ => {
    if (typeof _ === 'function') {
      immutable = _
    }
  }
  Object.defineProperty(fn, 'get', {value: get})
  Object.defineProperty(fn, 'set', {value: set})
  Object.defineProperty(fn, 'immutable', {value: set_immutable})
  return fn
}

export { lens }
