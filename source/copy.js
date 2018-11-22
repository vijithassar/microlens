const copy = (data, keys) => {
  if (keys.length === 0) return data

  const key = keys.shift()

  if (Array.isArray(data)) {
    return data.map((item, i) => i == key ? copy(item, keys.slice()) : item)
  }

  if (data && typeof data === 'object') {
    const target = {}
    for (const k in data) {
      target[k] = k === key ? copy(data[k], keys.slice()) : data[k]
    }
    return target
  }

  return data
}

export { copy }