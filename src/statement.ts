import { Expression } from "./expression"

export interface Statement {
  accept(visitor: StatementVisitor<any>): any
}

export interface StatementVisitor<R> {
  visitExpressionStatement(Statement: ExpressionStatement): R
  visitPrintStatement(Statement: PrintStatement): R
}

export class ExpressionStatement implements Statement {
  constructor(public expression: Expression) {}

  accept<R>(visitor: StatementVisitor<R>) {
    return visitor.visitExpressionStatement(this)
  }
}

export class PrintStatement implements Statement {
  constructor(public expression: Expression) {}

  accept<R>(visitor: StatementVisitor<R>) {
    return visitor.visitPrintStatement(this)
  }
}
