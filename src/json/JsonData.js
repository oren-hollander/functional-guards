const JsonString = 'JsonString'
const JsonNumber = 'JsonNumber'
const JsonObject = 'JsonObject'
const JsonArray = 'JsonArray'

const JsonType = value => JsonObject

const JsonPointer = ptr => {
  
  return {
    sub: k => JsonPointer(`${ptr}/${k}`),
    getPointer: () => ptr
  }
}

JsonPointer.isPointer = ptr => true
JsonPointer.fromString = ptr => JsonPointer()

const JsonRef = (path, ptr) => ({$ref: `${path}#${JsonPointer(ptr)}`})

JsonRef.isRef = ref => JsonType(ref) === JsonObject && ref.keys() === ['$ref'] && JsonPointer.isPointer(ref.$ref)
JsonRef.getPath = ref => ''
JsonRef.getPointer = ref => ''

function JsonData() {
  var json = {}

  function setValue (ptr, value){

  }

  function getValue (ptr) {

  }

  function toJson() {
    return json
  }

  return {setValue, getValue, toJson}
}

const JsonDataVariant = (... jsonData) => {
  return {
    setValue: variant => jsonData.setValue(variant),
    getValue: jsonData.getValue(variant)
  }
}

const JsonDataReader = jsonData => {
  return {
    getValue: variant => ptr => {
      const value = jsonData.getValue(variant)(ptr)
      if(JsonRef.isRef(value))
        return jsonData.getValue(variant)(JsonRef.getPointer(value))
      else if(JsonType(value) == JsonObject)
        return value
      else if(JsonType(value) == JsonArray)
        return value
      else
        return value
    }
  }
}

function test() {
  const json = JsonData()
  json.setValue('/x', 5)
  json.setValue('/y', {a: 1, b: true})
  json.setValue('/y/a', 2)

  json.setValue(JsonPointer.fromString('/a/b'), 42)
  json.setValue(JsonPointer().key('a').key('b'), 43)
  json.getValue(JsonPointer().key('a').key('b'))
}

test()