import { lens } from '../'
import { test } from 'tape'

test('obeys the first law of well behaved lenses (GetPut)', t => {
  const first = lens([0])
  const data = [1, 2, 3]
  const before_value = first(data)
  const before_structure = JSON.stringify(data)
  first(data, before_value)
  const after_value = first(data)
  const after_structure = JSON.stringify(data)
  t.equal(before_value, after_value)
  t.equal(before_structure, after_structure)
  t.end()
})

test('obeys the second law of well behaved lenses (PutGet)', t => {
  const first = lens([0])
  const value = []
  const data = [1, 2, 3]
  first(data, value)
  const retrieved = first(data)
  t.equal(retrieved, value)
  t.end()
})

test('obeys the third law of well behaved lenses (PutPut)', t => {
  const first = lens([0])
  const value = 4
  const data = [1, 2, 3]
  first(data, value)
  const before_structure = JSON.stringify(data)
  first(data, value)
  const after_structure = JSON.stringify(data)
  t.equal(before_structure, after_structure)
  t.end()
})
