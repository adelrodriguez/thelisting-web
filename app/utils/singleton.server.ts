export const singleton = <Value>(name: string, valueFactory: () => Value): Value => {
  const g = global as { __singletons?: Record<string, Value> }
  g.__singletons ??= {}
  g.__singletons[name] ??= valueFactory()

  return g.__singletons[name] as Value
}
