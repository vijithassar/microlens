import { test } from 'tape'
import { lens } from '../'
import { compose } from '../source/compose'

test('exports a function', t => {
  t.equal(typeof lens, 'function')
  t.end()
})

test('is a function factory', t => {
  t.equal(typeof lens([0]), 'function')
  t.end()
})

test('gets values', t => {
  const first = lens([0])
  const data = ['a', 'b', 'c']
  t.equal(first(data), 'a')
  t.end()
})

test('gets nested values', t => {
  const nested = lens([0, 'values', 1])
  const data = [
    {values: [10, 20]},
    {values: [30, 40]}
  ]
  t.equal(nested(data), 20)
  t.end()
})

test('sets values', t => {
  const first = lens([0])
  const data = ['a', 'b', 'c']
  first(data, 'x')
  t.equal(data[0], 'x')
  t.end()
})

test('sets nested values', t => {
  const nested = lens([0, 'values', 1])
  const data = [
    {values: [10, 20]},
    {values: [30, 40]}
  ]
  const value = 50
  nested(data, value)
  t.equal(value, nested(data))
  t.end()
})

test('sets values to undefined', t => {
  const first = lens([0])
  const data = [1, 2, 3]
  first(data, void 0)
  t.equal(typeof first(data), 'undefined')
  t.end()
})

test('composes getters manually', t => {
  const value = lens(['value'])
  const first = lens([0])
  const first_value = _ => value(first(_))
  const data = [
    {value: 3},
    {value: 4},
    {value: 5}
  ]
  t.equal(first_value(data), 3)
  t.end()
})

test('composes setters manually', t => {
  const value = lens(['value'])
  const first = lens([0])
  const first_value = (structure, input) => value(first(structure), input)
  const data = [
    {value: 3},
    {value: 4},
    {value: 5}
  ]
  first_value(data, 4)
  t.equal(data[0].value, 4)
  t.end()
})

test('composes hybrid getter/setters manually', t => {
  const value = lens(['value'])
  const first = lens([0])
  const new_value = 4
  const first_value = function(structure, input) {
    return arguments[1] ? value(first(structure), input) : value(first(structure))
  }
  const data = [
    {value: 3},
    {value: 4},
    {value: 5}
  ]
  first_value(data, new_value)
  t.equal(first_value(data), new_value)
  t.equal(data[0].value, new_value)
  t.end()
})

test('returns the original structure after successfully setting', t => {
  const nested = lens([0, 'values', 1])
  const data = [
    {values: [10, 20]},
    {values: [30, 40]}
  ]
  const value = 50
  const result = nested(data, value)
  t.equal(data, result)
  t.end()
})

test('injects copy function', t => {
  const value = 4
  const hook = () => value
  const first = lens([0], hook)
  const data = [1, 2, 3]
  const result = first(data, 1)
  t.equal(result, value)
  t.end()
})

test('uses copy function', t => {
  const copy = input => JSON.parse(JSON.stringify(input))
  const first = lens([0], copy)
  const data = [1, 2, 3]
  const before = JSON.stringify(data)
  const result = first(data, 1)
  const after = JSON.stringify(result)
  t.equal(before, after)
  t.notEqual(data, result)
  t.end()
})

test('leaves original data structure when invoking copy function', t => {
  const copy = input => JSON.parse(JSON.stringify(input))
  const first = lens([0], copy)
  const data = [1, 2, 3]
  const before = JSON.stringify(data)
  const result = first(data, 2)
  const after = JSON.stringify(result)
  t.notEqual(before, after)
  t.equal(JSON.stringify(data), before)
  t.end()
})

test('adds keys as necessary during a set operation', t => {
  const name = 'john'
  const data = [{}, {}, {}]
  const target = lens([0, 'name', 'first'])
  target(data, name)
  const result = target(data)
  t.equal(result, name)
  t.equal(data[0].name.first, name)
  t.end()
})

test('composition helper gets values', t => {
  const first = lens([0])
  const value = lens(['value'])
  const first_value = compose([first, value])
  const data = [{value: 2}, {}, {}]
  t.equal(first_value(data), 2)
  t.end()
})

test('composition helper sets values', t => {
  const first = lens([0])
  const value = lens(['value'])
  const first_value = compose([first, value])
  const data = [{value: 2}, {}, {}]
  first_value(data, 3)
  t.equal(first_value(data), 3)
  t.equal(data[0].value, 3)
  t.end()
})

test('composition helper returns the original structure after successfully setting', t => {
  const first = lens([0])
  const value = lens(['value'])
  const first_value = compose([first, value])
  const data = [{value: 2}, {}, {}]
  const set = first_value(data, 3)
  t.equal(set, data)
  t.end()
})

test('composition helper applies copy function', t => {
  const copy = input => JSON.parse(JSON.stringify(input))
  const first = lens([0], copy)
  const value = lens(['value'])
  const first_value = compose([first, value])
  const data = [{value: 2}, {}, {}]
  const before = JSON.stringify(data)
  const set = first_value(data, 3)
  const reset = first_value(data, 2)
  const after = JSON.stringify(reset)
  t.equal(before, after)
  t.notEqual(set, data)
  t.end()
})

test('gets complex types', t => {
  const data = [
    () => 1,
    new Date()
  ]
  const first = lens([0])
  const second = lens([1])
  t.equal(typeof first(data), 'function')
  t.equal(first(data)(), 1)
  t.equal(typeof second(data), 'object')
  t.equal(typeof second(data).getFullYear, 'function')
  t.end()
})

test('sets complex types', t => {
  const data = [1, 2, 3]
  const value = 4
  const fn = () => value
  const first = lens([0])
  const second = lens([1])
  first(data, fn)
  second(data, new Date())
  t.equal(typeof first(data), 'function')
  t.equal(first(data)(), value)
  t.equal(typeof second(data), 'object')
  t.equal(typeof second(data).getFullYear, 'function')
  t.end()
})

test('sets values on complex types', t => {
  const data = new Date()
  const modified = lens(['modified'])
  modified(data, true)
  t.equal(modified(data), true)
  t.equal(data.modified, true)
  t.end()
})

test('applies copy function to complex types', t => {
  const copy = date => new Date(date.getTime())
  const modified = lens(['modified'], copy)
  const data = new Date()
  const result = modified(data, true)
  t.notEqual(data, result)
  t.equal(data[0], result[0])
  t.equal(data.modified, true)
  t.equal(modified(data), true)
  t.equal(typeof result.modified, 'undefined')
  t.equal(typeof modified(result), 'undefined')
  t.end()
})
