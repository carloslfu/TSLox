import {
  BinaryExpression,
  Expression,
  ExpressionVisitor,
  GroupingExpression,
  LiteralExpression,
  ValueType,
  UnaryExpression,
} from "./expression"
import { Token } from "./token"
import { TokenType } from "./tokenType"

export class Interpreter implements ExpressionVisitor<ValueType> {
  public hadRuntimeError = false

  interpret(expression: Expression) {
    try {
      const value = this.evaluate(expression)
      console.log("value:", value)
    } catch (error) {
      if (error instanceof RuntimeError) {
        this.runtimeError(error)
      }
    }
  }

  runtimeError(error: RuntimeError) {
    console.log(error.message + "\n[line " + error.token.line + "]")
    this.hadRuntimeError = true
  }

  evaluate(expression: Expression): ValueType {
    return expression.accept(this)
  }

  checkNumberOperand(operator: Token, operand: ValueType) {
    if (typeof operand === "number") {
      return
    }
    throw new RuntimeError(operator, "Operand must be a number.")
  }

  checkNumberOperands(operator: Token, left: ValueType, right: ValueType) {
    if (typeof left === "number" && typeof right === "number") {
      return
    }

    throw new RuntimeError(operator, "Operands must be numbers.")
  }

  visitLiteralExpression(expression: LiteralExpression): ValueType {
    return expression.value
  }

  visitGroupingExpression(expression: GroupingExpression): ValueType {
    return this.evaluate(expression.expression)
  }

  visitUnaryExpression(expression: UnaryExpression): ValueType {
    const right = this.evaluate(expression.right)
    this.checkNumberOperand(expression.operator, right)

    switch (expression.operator.type) {
      case TokenType.MINUS:
        return -right
      case TokenType.BANG:
        return !this.isTruthy(right)
    }

    // Unreachable.
    return null
  }

  isTruthy(value: ValueType) {
    if (value === null) {
      return false
    }

    if (typeof value === "boolean") {
      return value
    }

    return true
  }

  visitBinaryExpression(expression: BinaryExpression): ValueType {
    const left = this.evaluate(expression.left)
    const right = this.evaluate(expression.right)

    switch (expression.operator.type) {
      case TokenType.GREATER:
        this.checkNumberOperands(expression.operator, left, right)
        return left > right
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expression.operator, left, right)
        return left >= right
      case TokenType.LESS:
        this.checkNumberOperands(expression.operator, left, right)
        return left < right
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expression.operator, left, right)
        return left <= right
      case TokenType.EQUAL:
        return left === right
      case TokenType.BANG_EQUAL:
        return left !== right
      case TokenType.MINUS:
        this.checkNumberOperands(expression.operator, left, right)
        return (left as number) - (right as number)
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return left + right
        }

        if (typeof left === "string" && typeof right === "string") {
          return left + right
        }

        throw new RuntimeError(expression.operator, "Operands must be two numbers or two strings.")
      case TokenType.SLASH:
        this.checkNumberOperands(expression.operator, left, right)
        return (left as number) / (right as number)
      case TokenType.STAR:
        this.checkNumberOperands(expression.operator, left, right)
        return (left as number) * (right as number)
    }

    // Unreachable.
    return null
  }
}

class RuntimeError extends Error {
  constructor(public token: Token, public message: string) {
    super(message)
  }
}
