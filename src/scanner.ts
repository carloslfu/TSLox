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
          error(this.line, `Unexpected character: "${char}".`)
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
    this.tokens.push(new Token(type, text, literal, this.line))
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
    if (this.isAtEnd()) return "\0"
    return this.code.charAt(this.current)
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
}
