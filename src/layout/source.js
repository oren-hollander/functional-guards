'use strict'

const Value = (value = 0) => ({
  read: () => value,
  write: v => {value = v}
})

const Source = f => ({
  value: f,
  map: mf => Source(() => mf(f())),
  combine: (source, cf) => Source(() => cf(f(), source.value()))
})

const v = Value(10)
console.log(v.read())
v.write(20)
console.log(v.read())

const s = Source(v.read)
console.log(s.value())
v.write(30)
console.log(s.value())

const s2 = s.map(x => x * 2)
console.log(s2.value())

v.write(40)
console.log(s.value())
console.log(s2.value())

const v2 = Value(50)
const s3 = Source(v2.read)

const s4 = s2.combine(s3, Math.max)

console.log(s2.value(), s3.value(), s4.value())

v2.write(90)

console.log(s2.value(), s3.value(), s4.value())

// const MutableSource = (value = 0) => {
//   return {
//     value: () => value,
//     update: v => {value = v}
//   }
// }
//
// const Source = (source, f) => ({
//   value: () => f(source.value())
// })
//
// const CombinedSource = (s1, s2, f) => ({
//   value: () => f(s1.value(), s2.value())
// })
