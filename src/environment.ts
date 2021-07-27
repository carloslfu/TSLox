import { ValueType } from "./expression"
import { RuntimeError } from "./interpreter"
import { Token } from "./token"

export class Environment {
  values: Record<string, ValueType> = {}

  constructor(public enclosing: Environment = null) {}

  define(name: string, value: ValueType) {
    this.values[name] = value
  }

  get(name: Token): ValueType {
    if (name.lexeme in this.values) {
      return this.values[name.lexeme]
    }

    if (this.enclosing != null) {
      return this.enclosing.get(name)
    }

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.")
  }

  assign(name: Token, value: ValueType) {
    if (name.lexeme in this.values) {
      this.values[name.lexeme] = value
      return
    }

    if (this.enclosing != null) {
      this.enclosing.assign(name, value)
      return
    }

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.")
  }
}
