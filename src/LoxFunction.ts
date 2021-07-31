import { Environment } from "./environment"
import { ValueType } from "./expression"
import { Interpreter } from "./interpreter"
import { FunctionDeclarationStatement } from "./statement"

export class LoxFunction {
  constructor(
    public arity: () => number,
    public call: (interpreter: Interpreter, args: ValueType[]) => ValueType,
    public toString: () => string,
    public declaration?: FunctionDeclarationStatement,
  ) {}
}

export const createLoxDefinedFunction = (
  declaration: FunctionDeclarationStatement,
): LoxFunction => {
  const call: LoxFunction["call"] = (interpreter, args) => {
    const environment = new Environment(interpreter.globals)
    for (let i = 0; i < declaration.params.length; i++) {
      environment.define(declaration.params[i].lexeme, args[i])
    }

    interpreter.executeBlock(declaration.body, environment)
    return null
  }

  return new LoxFunction(
    () => declaration.params.length,
    call,
    () => "<fn " + declaration.name.lexeme + ">",
  )
}
