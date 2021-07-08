import { Expression, ExpressionOperation, ExpressionType } from "./expression"

export const AstPrinterOperation: ExpressionOperation<string> = {
  [ExpressionType.Binary]: (expression) =>
    parenthesize(expression.operator.lexeme, expression.left, expression.right),
  [ExpressionType.Grouping]: (expression) => parenthesize("group", expression.expression),
  [ExpressionType.Literal]: (expression) => {
    if (expression.value == null) {
      return "nil"
    }

    return String(expression.value)
  },
  [ExpressionType.Unary]: (expression) =>
    parenthesize(expression.operator.lexeme, expression.right),
}

export const printAst = (expression: Expression) =>
  AstPrinterOperation[expression.type](expression as any)

function parenthesize(name: string, ...expressions: Expression[]) {
  let result = "(" + name

  for (const expression of expressions) {
    result = result + " " + printAst(expression)
  }

  result = result + ")"

  return result
}
