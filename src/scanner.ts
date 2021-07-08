import { error } from "./error"
import { Token } from "./token"
import { TokenType } from "./tokenType"

export class Scanner {
  public start = 0
  public current = 0
  public line = 1

  public tokens: Token[] = []

  constructor(public code: string) {}

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      // We are at the beginning of the next lexeme.
      this.start = this.current

      const char = this.advance()
      switch (char) {
        case "(":
          this.addToken(TokenType.LEFT_PAREN)
          break
        case ")":
          this.addToken(TokenType.RIGHT_PAREN)
          break
        case "{":
          this.addToken(TokenType.LEFT_BRACE)
          break
        case "}":
          this.addToken(TokenType.RIGHT_BRACE)
          break
        case ",":
          this.addToken(TokenType.COMMA)
          break
        case ".":
          this.addToken(TokenType.DOT)
          break
        case "-":
          this.addToken(TokenType.MINUS)
          break
        case "+":
          this.addToken(TokenType.PLUS)
          break
        case ";":
          this.addToken(TokenType.SEMICOLON)
          break
        case "*":
          this.addToken(TokenType.STAR)
          break
        case "!":
          this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG)
          break
        case "=":
          this.addToken(this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL)
          break
        case "<":
          this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS)
          break
        case ">":
          this.addToken(this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER)
          break
        case "/":
          if (this.match("/")) {
            // A comment goes until the end of the line.
            while (this.peek() != "\n" && !this.isAtEnd()) this.advance()
          } else {
            this.addToken(TokenType.SLASH)
          }
          break
        case '"':
          this.string()
          break
        case " ":
        case "\r":
        case "\t":
          // Ignore whitespace.
          break

        case "\n":
          this.line++
          break

        default:
          if (isDigit(char)) {
            this.number()
          } else if (isAlpha(char)) {
            this.identifier()
          } else {
            error(this.line, `Unexpected character: "${char}".`)
          }
          break
      }
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, this.line))

    return this.tokens
  }

  isAtEnd() {
    return this.current >= this.code.length
  }

  advance() {
    const char = this.code.charAt(this.current)
    this.current++
    return char
  }

  addToken(type: TokenType, literal?: any) {
    const text = this.code.substring(this.start, this.current)
    this.tokens.push({ type, lexeme: text, literal, line: this.line })
  }

  match(expected: string) {
    if (this.isAtEnd()) {
      return false
    }
    if (this.code.charAt(this.current) != expected) {
      return false
    }

    this.current++
    return true
  }

  peek() {
    if (this.isAtEnd()) {
      return "\0"
    }
    return this.code.charAt(this.current)
  }

  peekNext() {
    if (this.current + 1 >= this.code.length) {
      return "\0"
    }
    return this.code.charAt(this.current + 1)
  }

  string() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == "\n") {
        this.line++
      }
      this.current++
    }

    if (this.isAtEnd()) {
      error(this.line, "Unterminated string.")
      return
    }

    // The closing ".
    this.current++

    // Trim the surrounding quotes.
    const value = this.code.substring(this.start + 1, this.current - 1)
    this.addToken(TokenType.STRING, value)
  }

  number() {
    while (isDigit(this.peek())) {
      this.advance()
    }

    // Look for a fractional part.
    if (this.peek() == "." && isDigit(this.peekNext())) {
      // Consume the "."
      this.advance()

      while (isDigit(this.peek())) {
        this.advance()
      }
    }

    this.addToken(TokenType.NUMBER, Number(this.code.substring(this.start, this.current)))
  }

  identifier() {
    while (isAlphaNumeric(this.peek())) {
      this.advance()
    }

    const text = this.code.substring(this.start, this.current)
    let type = keywords[text]
    if (type === undefined) {
      type = TokenType.IDENTIFIER
    }
    this.addToken(type)
  }
}

function isDigit(char: string): boolean {
  return char >= "0" && char <= "9"
}

function isAlpha(char: string) {
  return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char == "_"
}

function isAlphaNumeric(char: string) {
  return isAlpha(char) || isDigit(char)
}

const keywords: Record<string, TokenType> = {
  and: TokenType.AND,
  class: TokenType.CLASS,
  else: TokenType.ELSE,
  false: TokenType.FALSE,
  for: TokenType.FOR,
  fun: TokenType.FUN,
  if: TokenType.IF,
  nil: TokenType.NIL,
  or: TokenType.OR,
  print: TokenType.PRINT,
  return: TokenType.RETURN,
  super: TokenType.SUPER,
  this: TokenType.THIS,
  true: TokenType.TRUE,
  var: TokenType.VAR,
  while: TokenType.WHILE,
}
