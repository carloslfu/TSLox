import { ValueType } from "./expression"
import { RuntimeError } from "./interpreter"
import { Token } from "./token"

export class Environment {
  values: Record<string, ValueType> = {}

  define(name: string, value: ValueType) {
    this.values[name] = value
  }

  get(name: Token) {
    if (name.lexeme in this.values) {
      return this.values[name.lexeme]
    }

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.")
  }
}
