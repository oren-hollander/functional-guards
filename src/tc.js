'use strict'

const flip = f => a => b => f(b)(a)
const id = x => x
const get = x => () => x

const Ord = (eq, gt) => ({
  lt: x => !gt(x) && !eq(x),
  lte: x => !gt(x),
  gte: x => gt(x) || eq(x)
})

const Num = v => {
  const value = () => v
  const eq = n => v === n.value()
  const show = () => `${v}`
  const gt = n => v > n.value()

  const ord = Ord(eq, gt)
  // const lt = n => v < n.value()
  // const gte = n => v >= n.value()
  // const lte = n => v <= n.value()

  return Object.create({value, eq, show, gt, lt: ord.lt, gte: ord.gte, lte: ord.lte})
}

const Str = v => {
  const value = () => v
  const eq = s => c === s.value()
  const show = () => v
  const gt = s => v.localeCompare(s.value()) > 0
  // const lt = s => v.localeCompare(s.value()) < 0
  // const gte = s => v.localeCompare(s.value()) >= 0
  // const lte = s => v.localeCompare(s.value()) <= 0
  const ord = Ord(eq, gt)

  return Object.create({value, eq, show, gt, lt: ord.lt, gte: ord.gte, lte: ord.lte})
}

const Person = (name, age) => {
  const show = () => `My name is ${name} and I'm ${age} years old`
  const grow = () => Person(name, age + 1)
  const eq = p => name === p.name() && age === p.age()
  const gt = p => {
    if(name.gt(p.name()))
      return true
    else if(name.lt(p.name()))
      return false
    else
      return age.gt(p.age())
  }
  const ord = Ord(eq, gt)

  return Object.create({show, name: get(name), age: get(age), grow, eq, gt, lt: ord.lt, gte: ord.gte, lte: ord.lte})
}

const Nothing = Object.create({
  get: () => {throw new Error('Nothing')},
  fmap: () => Nothing,
  foldl: (f, z) => z,
  show: () => 'Nothing',
  eq: m => m === Nothing
})

const Just = x => {
  const get = () => x
  const fmap = f => Just(f(x))
  const foldl = (f, z) => f(x, z)
  const show = () => `Just ${x.show()}`
  const eq = m => m !== Nothing && x.eq(m.get())

  return Object.create({get, fmap, foldl, show, eq})
}

const Nil = Object.create({
  head: () => {throw new Error('Nil')},
  tail: () => {throw new Error('Nil')},
  fmap: () => Nil,
  foldl: (f, z) => z,
  append: id,
  reverse: () => Nil,
  show: () => 'Nil',
  filter: () => Nil,
  sort: () => Nil,
  find: () => Nothing,
  nil: () => true
})

const List = (head, tail) => {

  const nil = () => false

  const fmap = f => List(f(head), tail.fmap(f))

  const foldl = (f, z) => tail.foldl(f, f(z, head))

  const append = l => List(head, tail.append(l))

  const reverse = () => tail.reverse().append(List(head, Nil))

  const show = () => `${head.show()}:${tail.show()}`

  const filter = p => {
    if(p(head))
      return List(head, tail.filter(p))
    else
      return tail.filter(p)
  }

  const sort = () =>
    tail.filter(x => x.lte(head)).sort().append(List(head, Nil)).append(tail.filter(x => x.gt(head)).sort())

  const find = p => {
    if(p(head))
      return Just(head)
    else
      return tail.find(p)
  }

  return {nil, head: get(head), tail: get(tail), fmap, foldl, append, reverse, show, filter, sort, find}
}

List.fromArray = xs => {
  let l = Nil
  for (const x of xs)
    l = List(x, l)
  return l.reverse()
}

const p = Person(Str('John'), Num(42))
console.log(p.show())

console.log(Just(p).fmap(p => p.grow()).show())
console.log(Nothing.fmap(p => p.grow()).show())

console.log(Just(Person(Str('John'), Num(42))).eq(Just(Person(Str('John'), Num(42)))))
console.log(Just(Person(Str('John'), Num(42))).eq(Just(Person(Str('Joh'), Num(42)))))
console.log(Just(Person(Str('John'), Num(42))).eq(Just(Person(Str('John'), Num(41)))))
console.log(Just(Person(Str('John'), Num(42))).eq(Nothing))
console.log(Nothing.eq(Just(p)))
console.log(Nothing.eq(Nothing))

// console.log(List(Num(1), Nil).show())
const l1 = List.fromArray([Str('a'), Str('c')])
const l2 = List.fromArray([Str('b'), Str('d')])
// const l1 = List(Str('a'), List(Str('b'), Nil))
// const l2 = List(Str('c'), List(Str('d'), Nil))
console.log(l1.show())
console.log(l2.show())

const l3 = l1.append(l2)
console.log(l3.show())

const l4 = l3.reverse()
console.log(l4.show())

const l5 = l4.sort()
console.log(l5.show())

// console.log(show(sort(append(list(['a', 'b', 'e']), list(['c', 'b', 'f'])))))
// const people = list([create('John', 42), create('Paul', 43)])
// console.log(show(people))

// const p = find(p => p.age > 42, people)
// console.log(mShow(p))
// console.log(p.type)
// const l2 = cons(3, cons(1, cons(2, Nil)))
// console.log(show(l2))
// console.log(show(sort(l2)))



