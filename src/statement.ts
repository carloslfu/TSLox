import { Expression } from "./expression"
import { Token } from "./token"

export interface Statement {
  accept(visitor: StatementVisitor<any>): any
}

export interface StatementVisitor<R> {
  visitExpressionStatement(statement: ExpressionStatement): R
  visitPrintStatement(statement: PrintStatement): R
  visitVariableStatement(statement: VariableDeclarationStatement): R
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

export class VariableDeclarationStatement implements Statement {
  constructor(public name: Token, public initializer: Expression) {}

  accept<R>(visitor: StatementVisitor<R>) {
    return visitor.visitVariableStatement(this)
  }
}
