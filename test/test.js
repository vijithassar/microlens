import { test } from 'tape'
import { lens } from '../'

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

test('exposes getter function as method', t => {
  const first = lens([0])
  t.equal(typeof first.get, 'function')
  t.end()
})

test('getter method matches default behavior', t => {
  const first = lens([0])
  const data = [[], [], []]
  t.equal(first.get(data), first(data))
  t.end()
})

test('exposes setter function as method', t => {
  const first = lens([0])
  t.equal(typeof first.set, 'function')
  t.end()
})


test('setter method matches default behavior', t => {
  const first = lens([0])
  const data = [[], [], []]
  const value = []
  first.set(data, value)
  t.equal(value, first(data))
  t.end()
})

test('composes getters with main function', t => {
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

test('composes getters with method reference', t => {
  const value = lens(['value'])
  const first = lens([0])
  const first_value = _ => value.get(first.get(_))
  const data = [
    {value: 3},
    {value: 4},
    {value: 5}
  ]
  t.equal(first_value(data), 3)
  t.end()
})

test('composes setters', t => {
  const value = lens(['value'])
  const first = lens([0])
  const first_value = (structure, input) => value(first(structure), input)
  const data = [
    {value: 3},
    {value: 4},
    {value: 5}
  ]
  first_value(data, 4)
  t.equal(first_value(data), 4)
  t.end()
})

test('composes setters with method references', t => {
  const value = lens(['value'])
  const first = lens([0])
  const first_value = (structure, input) => value.set(first.get(structure), input)
  const data = [
    {value: 3},
    {value: 4},
    {value: 5}
  ]
  first_value(data, 4)
  t.equal(data[0].value, 4)
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

test('injects immutability function', t => {
  const value = 4
  const hook = () => value
  const first = lens([0])
  first.immutable(hook)
  const data = [1, 2, 3]
  const result = first(data, 1)
  t.equal(result, value)
  t.end()
})

test('uses immutability function', t => {
  const immutable = input => JSON.parse(JSON.stringify(input))
  const first = lens([0])
  first.immutable(immutable)
  const data = [1, 2, 3]
  const before = JSON.stringify(data)
  const result = first(data, 1)
  const after = JSON.stringify(result)
  t.equal(before, after)
  t.notEqual(data, result)
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
