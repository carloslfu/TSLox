import { Environment } from "./environment"
import { ValueType } from "./expression"
import { Interpreter, Return } from "./interpreter"
import { FunctionDeclarationStatement } from "./statement"

export class LoxFunction {
  constructor(
    public arity: () => number,
    public call: (interpreter: Interpreter, args: ValueType[]) => ValueType,
    public toString: () => string,
    public declaration: FunctionDeclarationStatement = null,
    public closure: Environment = null,
  ) {}
}

export const createLoxDefinedFunction = (
  declaration: FunctionDeclarationStatement,
  closure: Environment,
): LoxFunction => {
  const call: LoxFunction["call"] = (interpreter, args) => {
    const environment = new Environment(closure)
    for (let i = 0; i < declaration.params.length; i++) {
      environment.define(declaration.params[i].lexeme, args[i])
    }

    try {
      interpreter.executeBlock(declaration.body, environment)
    } catch (error) {
      if (error instanceof Return) {
        return error.value
      }
    }
    return null
  }

  return new LoxFunction(
    () => declaration.params.length,
    call,
    () => "<fn " + declaration.name.lexeme + ">",
    declaration,
    closure,
  )
}
