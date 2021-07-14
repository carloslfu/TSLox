import {
  BinaryExpression,
  Expression,
  ExpressionVisitor,
  GroupingExpression,
  LiteralExpression,
  ValueType,
  UnaryExpression,
} from "./expression"
import { TokenType } from "./tokenType"

export class Interpreter implements ExpressionVisitor<ValueType> {
  evaluate(expression: Expression) {
    return expression.accept(this)
  }

  visitLiteralExpression(expression: LiteralExpression): ValueType {
    return expression.value
  }

  visitGroupingExpression(expression: GroupingExpression): ValueType {
    return this.evaluate(expression.expression)
  }

  visitUnaryExpression(expression: UnaryExpression): ValueType {
    const right = this.evaluate(expression.right)

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
        return left > right
      case TokenType.GREATER_EQUAL:
        return left >= right
      case TokenType.LESS:
        return left < right
      case TokenType.LESS_EQUAL:
        return left <= right
      case TokenType.EQUAL:
        return left === right
      case TokenType.BANG_EQUAL:
        return left !== right
      case TokenType.MINUS:
        return left - right
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return left + right
        }

        if (typeof left === "string" && typeof right === "string") {
          return left + right
        }
      case TokenType.SLASH:
        return left / right
      case TokenType.STAR:
        return left * right
    }

    // Unreachable.
    return null
  }
}
