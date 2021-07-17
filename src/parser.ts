import { error } from "./error"
import {
  BinaryExpression,
  Expression,
  GroupingExpression,
  LiteralExpression,
  UnaryExpression,
} from "./expression"
import { ExpressionStatement, PrintStatement, Statement } from "./statement"
import { Token } from "./token"
import { TokenType } from "./tokenType"

export class Parser {
  private current = 0

  constructor(public tokens: Token[]) {}

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
    return this.equality()
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

  statement(): Statement {
    if (this.match(TokenType.PRINT)) {
      return this.printStatement()
    }

    return this.expressionStatement()
  }

  printStatement() {
    const expression = this.expression()
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.")
    return new PrintStatement(expression)
  }

  expressionStatement() {
    const expression = this.expression()
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.")
    return new ExpressionStatement(expression)
  }

  parse(): Statement[] {
    const statements: Statement[] = []
    while (!this.isAtEnd()) {
      statements.push(this.statement())
    }

    return statements
  }
}

class ParseError extends Error {}
