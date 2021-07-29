import { error } from "./error"
import {
  BinaryExpression,
  Expression,
  GroupingExpression,
  LiteralExpression,
  LogicalExpression,
  UnaryExpression,
  VariableExpression,
} from "./expression"
import {
  AssignmentStatement,
  BlockStatement,
  ExpressionStatement,
  IfStatement,
  PrintStatement,
  Statement,
  VariableDeclarationStatement,
  WhileStatement,
} from "./statement"
import { Token } from "./token"
import { TokenType } from "./tokenType"

export class Parser {
  private current = 0

  constructor(public tokens: Token[]) {}

  parse(): Statement[] {
    const statements: Statement[] = []
    while (!this.isAtEnd()) {
      statements.push(this.statement())
    }

    return statements
  }

  match(...types: TokenType[]) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }

    return false
  }

  check(type: TokenType) {
    if (this.isAtEnd()) {
      return false
    }

    return this.peek().type === type
  }

  advance() {
    if (!this.isAtEnd()) {
      this.current++
    }

    return this.previous()
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF
  }

  peek() {
    return this.tokens[this.current]
  }

  previous() {
    return this.tokens[this.current - 1]
  }

  // expression -> equality ;
  expression(): Expression {
    return this.or()
  }

  or() {
    let expression = this.and()

    while (this.match(TokenType.OR)) {
      const operator = this.previous()
      const right = this.and()
      expression = new LogicalExpression(expression, operator, right)
    }

    return expression
  }

  and() {
    let expression = this.equality()

    while (this.match(TokenType.AND)) {
      const operator = this.previous()
      const right = this.equality()
      expression = new LogicalExpression(expression, operator, right)
    }

    return expression
  }

  // equality -> comparison ( ( "!=" | "==" ) comparison )* ;
  equality(): Expression {
    let expression = this.comparison()

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous()
      const right = this.comparison()
      expression = new BinaryExpression(expression, operator, right)
    }

    return expression
  }

  // comparison -> term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
  comparison(): Expression {
    let expression = this.term()

    while (
      this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)
    ) {
      const operator = this.previous()
      const right = this.term()
      expression = new BinaryExpression(expression, operator, right)
    }

    return expression
  }

  // term -> factor ( ( "-" | "+" ) factor )* ;
  term(): Expression {
    let expression = this.factor()

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous()
      const right = this.factor()
      expression = new BinaryExpression(expression, operator, right)
    }

    return expression
  }

  // factor -> unary ( ( "/" | "*" ) unary )* ;
  factor(): Expression {
    let expression = this.unary()

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous()
      const right = this.unary()
      expression = new BinaryExpression(expression, operator, right)
    }

    return expression
  }

  // unary -> ( "!" | "-" ) unary | primary ;
  unary(): Expression {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous()
      const right = this.unary()
      return new UnaryExpression(operator, right)
    }

    return this.primary()
  }

  // primary -> NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")" ;
  primary(): Expression {
    if (this.match(TokenType.FALSE)) {
      return new LiteralExpression(false)
    }
    if (this.match(TokenType.TRUE)) {
      return new LiteralExpression(true)
    }
    if (this.match(TokenType.NIL)) {
      return new LiteralExpression(null)
    }

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new LiteralExpression(this.previous().literal)
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new VariableExpression(this.previous())
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expression = this.expression()
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
      return new GroupingExpression(expression)
    }

    throw this.parseError(this.peek(), "Expect expression.")
  }

  consume(type: TokenType, message: string) {
    if (this.check(type)) {
      return this.advance()
    }

    throw this.parseError(this.peek(), message)
  }

  error(token: Token, message: string) {
    if (token.type === TokenType.EOF) {
      error(token.line, " at end: " + message)
    } else {
      error(token.line, " at '" + token.lexeme + "': " + message)
    }
  }

  parseError(token: Token, message: string) {
    this.error(token, message)
    return new ParseError()
  }

  synchronize() {
    this.advance()

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) {
        return
      }

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return
      }

      this.advance()
    }
  }

  // statement -> variableDeclaration | printStatement | expressionStatement
  statement(): Statement {
    try {
      if (this.match(TokenType.VAR)) {
        return this.variableDeclaration()
      }

      if (this.match(TokenType.IF)) {
        return this.ifStatement()
      }

      if (this.match(TokenType.PRINT)) {
        return this.printStatement()
      }

      if (this.match(TokenType.WHILE)) {
        return this.whileStatement()
      }

      if (this.match(TokenType.LEFT_BRACE)) {
        return new BlockStatement(this.blockStatement())
      }

      return this.expressionAndAssignmentStatement()
    } catch (error) {
      if (error instanceof ParseError) {
        this.synchronize()
      }
    }
  }

  printStatement() {
    const expression = this.expression()
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.")
    return new PrintStatement(expression)
  }

  expressionAndAssignmentStatement() {
    const expression = this.expression()

    if (this.match(TokenType.EQUAL)) {
      if (expression instanceof VariableExpression) {
        const value = this.expression()
        const name = expression.name

        this.consume(TokenType.SEMICOLON, "Expect ';' after assignment.")
        return new AssignmentStatement(name, value)
      }

      const target = this.previous()
      this.parseError(target, "Invalid assignment target.")
      return
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.")
    return new ExpressionStatement(expression)
  }

  variableDeclaration() {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.")

    let initializer: Expression = null
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression()
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.")
    return new VariableDeclarationStatement(name, initializer)
  }

  blockStatement() {
    const statements: Statement[] = []

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.statement())
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.")
    return statements
  }

  ifStatement() {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.")
    const condition = this.expression()
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.")

    const thenBranch = this.statement()
    let elseBranch: Statement = null
    if (this.match(TokenType.ELSE)) {
      elseBranch = this.statement()
    }

    return new IfStatement(condition, thenBranch, elseBranch)
  }

  whileStatement() {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.")
    const condition = this.expression()
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.")
    const body = this.statement()

    return new WhileStatement(condition, body)
  }
}

class ParseError extends Error {}
