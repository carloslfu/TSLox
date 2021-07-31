import { ValueType } from "./expression"
import { Interpreter } from "./interpreter"

export class LoxFunction {
  constructor(
    public arity: () => number,
    public call: (interpreter: Interpreter, args: ValueType[]) => ValueType,
    public toString: () => string,
  ) {}
}
