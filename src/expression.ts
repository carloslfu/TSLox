import { Token } from "./token"

export type ValueType = number | string | boolean | null

export interface Expression {
  accept(visitor: ExpressionVisitor<any>): any
}

export interface ExpressionVisitor<R> {
  visitBinaryExpression(expression: BinaryExpression): R
  visitGroupingExpression(expression: GroupingExpression): R
  visitLiteralExpression(expression: LiteralExpression): R
  visitUnaryExpression(expression: UnaryExpression): R
}

export class BinaryExpression implements Expression {
  constructor(public left: Expression, public operator: Token, public right: Expression) {}

  accept<R>(visitor: ExpressionVisitor<R>) {
    return visitor.visitBinaryExpression(this)
  }
}

export class GroupingExpression implements Expression {
  constructor(public expression: Expression) {}

  accept<R>(visitor: ExpressionVisitor<R>) {
    return visitor.visitGroupingExpression(this)
  }
}

export class LiteralExpression implements Expression {
  constructor(public value: ValueType) {}

  accept<R>(visitor: ExpressionVisitor<R>) {
    return visitor.visitLiteralExpression(this)
  }
}

export class UnaryExpression implements Expression {
  constructor(public operator: Token, public right: Expression) {}

  accept<R>(visitor: ExpressionVisitor<R>) {
    return visitor.visitUnaryExpression(this)
  }
}
