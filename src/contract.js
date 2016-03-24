'use strict'


const DEBUG_TYPES = true

const check = (value, condition, error) => {
  if(condition)
    return value
  else
    throw new TypeError(error)
}

const tryCatch = thunk => {
  try {
    return thunk()
  }
  catch (e) {
    return e
  }
}

const isTypeError = e => e !== void 0 && e.constructor && e.constructor === TypeError

const any = x => x
const unit = v => check(v, v === void 0, 'Expected a unit')

const classOf = c => v => check(v, Function.prototype.call.bind({}.toString)(v) === `[object ${c}]`, `Expected ${c}`)
const typeOf = t => v => check(v, typeof v === t, `Expected ${t}`)

const array = classOf('Array')
const date = classOf('Date')
const regex = classOf('RegExp')

const func = typeOf('function')
const str = typeOf('string')
const obj = typeOf('object')
const bool = typeOf('boolean')
const num = typeOf('number')

const or = (...cs) => v => {
  const typeErrors = arr(func)(cs).map(c => tryCatch(_ => c(v))).filter(isTypeError)
  check(null, typeErrors.length !== cs.length, typeErrors.reduce((te1, te2) => te1.message + ' or ' + te2.message))
  return v
}

const and = (...cs) => v => arr(func)(cs).reduce((v, c) => c(v), v)

const not = c => v => {
  const result = tryCatch(_ => c(v))
  if(isTypeError(result))
    return v
  else
    throw new TypeError(`Didn't expect ${v}`)
}

const instanceOf = ctor => inst => check(v, inst instanceof ctor, `Expected an instance of ${ctor}`)

const int = n => check(n, (n | 0) === n, 'Expected an integer')

const nat = n => check(n, (n | 0) === n && n >= 0, 'Expected a natural')

const arr = c => a => array(a).map(func(c))

const map = c => o => Object.keys(obj(o)).reduce((r, k) => Object.assign(r, {[k]: func(c)(o[k])}), {})

const tuple = cs => args => {
  check(null, args.length === cs.length, `Expected ${cs.length} arguments`)
  return arr(func)(cs).map((c, i) => c(array(args)[i]))
}

const intf = i => v => Object.keys(map(func)(i)).reduce((r, k) => Object.assign(r, {[k]: i[k](obj(v)[k])}), {})

const debugTypes = (f, g) => typeof DEBUG_TYPES === 'undefined' ? f : g

const funx = (...cs) => f => (...args) =>
  fun(...cs)(f)(...args.slice(0, cs.length - 1))

const fun = (...cs) => f => (...args) =>
  debugTypes(f, func(cs[cs.length - 1])(f(...tuple(arr(func)(cs.slice(0, cs.length - 1)))(args))))

const gen = (...cs) => f => f(...cs)

//////////////////////////////////////
//             Tests
//////////////////////////////////////

const expect = exp => ({
  toBe: value => {
    if(_.isEqual(exp, value))
      console.log(value)
    else
      console.error(`${exp} is not ${value}`)
  }
})

const fail = f => {
  try {
    f()
    if(typeof DEBUG_TYPES !== 'undefined')
      console.error('Expected TypeError to be thrown')
  }
  catch (e){
    if(e.constructor === TypeError)
      console.log(e.message)
    else
      console.error('Expected a TypeError')
  }
}

const generalFunction = fun(any, any)(x => x.toString())
expect(generalFunction(4)).toBe('4')
expect(generalFunction(true)).toBe('true')

const aFunctionThatDoesNothing = fun(unit)(() => {})
expect(aFunctionThatDoesNothing()).toBe(void 0)
fail(_ => aFunctionThatDoesNothing(1))

const constantFunction = fun(unit)(() => 3)
fail(_ => constantFunction())

const add = fun(num, num, num)((x, y) => x + y)

const intMap = {a: 1, b: 2, c: 3}
const notAnIntMap = {a: 1, b: 1.1, c: '42'}

expect(map(int)(intMap)).toBe(intMap)
fail(_ => map(int)(notAnIntMap))

expect(add(1, 2)).toBe(3)
fail(_ => add(1, '1'))

const apply = fun(int, int, fun(int, int, int), int)((x, y, f) => f(x, y))
expect(apply(3, 2, (a, b) => a + b)).toBe(5)
expect(apply(3, 2, add)).toBe(5)

const even = v => check(v, v % 2 === 0, 'Expected an even number')
const dividedBy3 = v => check(v, v % 3 === 0, 'Expected a number that is divided by 3')

expect(even(2)).toBe(2)
fail(_ => even(1))

expect(dividedBy3(3)).toBe(3)
fail(_ => dividedBy3(1))

const evenAnDividedBy3 = and(even, dividedBy3)
fail(_ => evenAnDividedBy3(3))
fail(_ => evenAnDividedBy3(2))
expect(evenAnDividedBy3(6)).toBe(6)


const printPerson = fun(person, str)(p => `My name is ${p.name} and I'm ${p.age} years old.`)
expect(printPerson({name: 'John', age: 42})).toBe('My name is John and I\'m 42 years old.')
fail(_ => printPerson({name: 'John', age: '42'}))
fail(_ => printPerson({name: 'John', age2: 42}))
fail(_ => printPerson({nam: 'John', age2: 42}))

const eitherIntOrString = fun(or(int, str), str)(x => x.toString())
expect(eitherIntOrString(1)).toBe('1')
expect(eitherIntOrString('1')).toBe('1')
fail(_ => eitherIntOrString(true))

const intToString = funx(int, str)(i => i.toString())
// const is2ss = is => is.map(i => intToString(i))
const is2ss = is => is.map(intToString)

const mapIntsToStrings = fun(arr(int), arr(str))(is2ss)
expect(mapIntsToStrings([1, 2, 3])).toBe(['1', '2', '3'])

// const genReduce = gen(any)(t => fun(arr(t), fun(t, t, t), t)((ts, ft) => ts.reduce((a, b) => ft(a, b))))
const genReduce = gen(any)(T => fun(arr(T), funx(T, T, T), T)((ts, ft) => ts.reduce(ft)))

const concat = fun(str, str, str)((a, b) => a + b)

expect(genReduce([1, 2], add)).toBe(3)
expect(genReduce(['a', 'b'], concat)).toBe('ab')
fail(_ => genReduce([1, 2], concat))
fail(_ => genReduce(['a', 'b'], add))

const nonEmptyArr = a => check(array(a), a.length > 0, 'Expected a non empty array')
const nonEmptyIntArray = and(arr(int), nonEmptyArr)
expect(nonEmptyIntArray([1, 2, 3])).toBe([1, 2, 3])
fail(_ => nonEmptyIntArray([]))
fail(_ => nonEmptyIntArray(['1']))

const arrayOfIntOrStr = arr(or(int, str))
expect(arrayOfIntOrStr([1, 2, 3, 4])).toBe([1, 2, 3, 4])
expect(arrayOfIntOrStr(['1', '2', '3', '4'])).toBe(['1', '2', '3', '4'])
expect(arrayOfIntOrStr([1, 2, '3', '4'])).toBe([1, 2, '3', '4'])
fail(_ => arrayOfIntOrStr([1, 2, true, false]))

const arrayOfIntOrArrayOfString = or(arr(int), arr(str))
expect(arrayOfIntOrArrayOfString([1, 2, 3, 4])).toBe([1, 2, 3, 4])
expect(arrayOfIntOrArrayOfString(['1', '2', '3', '4'])).toBe(['1', '2', '3', '4'])
fail(_ => arrayOfIntOrArrayOfString([1, 2, '3', '4']))

