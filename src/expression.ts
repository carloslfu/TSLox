import { Token } from "./token"
import { TokenType } from "./tokenType"

export enum ExpressionType {
  Binary,
  Grouping,
  Literal,
  Unary,
}

export type LiteralType = number | string | null

export interface Expression {
  type: ExpressionType
}

export interface ExpressionOperation<R> {
  [ExpressionType.Binary]: (binaryExpression: BinaryExpression) => R
  [ExpressionType.Grouping]: (groupingExpression: GroupingExpression) => R
  [ExpressionType.Literal]: (literalExpression: LiteralExpression) => R
  [ExpressionType.Unary]: (binaryExpression: UnaryExpression) => R
}

export interface BinaryExpression extends Expression {
  type: ExpressionType.Binary
  left: Expression
  operator: Token
  right: Expression
}

export interface GroupingExpression extends Expression {
  type: ExpressionType.Grouping
  expression: Expression
}

export interface LiteralExpression extends Expression {
  type: ExpressionType.Literal
  value: LiteralType
}

export interface UnaryExpression extends Expression {
  type: ExpressionType.Unary
  operator: TokenType
  right: Expression
}
