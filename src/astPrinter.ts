import {
  BinaryExpression,
  Expression,
  ExpressionVisitor,
  GroupingExpression,
  LiteralExpression,
  UnaryExpression,
} from "./expression"

export class AstPrinter implements ExpressionVisitor<string> {
  print(expression: Expression) {
    return expression.accept(this)
  }

  parenthesize(name: string, ...expressions: Expression[]) {
    let result = "(" + name

    for (const expression of expressions) {
      result = result + " " + expression.accept(this)
    }

    result = result + ")"

    return result
  }

  visitBinaryExpression(expression: BinaryExpression) {
    return this.parenthesize(expression.operator.lexeme, expression.left, expression.right)
  }

  visitGroupingExpression(expression: GroupingExpression) {
    return this.parenthesize("group", expression.expression)
  }

  visitLiteralExpression(expression: LiteralExpression) {
    if (expression.value === null) {
      return "nil"
    }

    return String(expression.value)
  }

  visitUnaryExpression(expression: UnaryExpression) {
    return this.parenthesize(expression.operator.lexeme, expression.right)
  }
}
