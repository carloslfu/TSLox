import { TokenType } from "./tokenType"

export class Token {
  constructor(
    public type: TokenType,
    public lexeme: string,
    public literal: any,
    public line: number,
  ) {
    this.type = type
    this.lexeme = lexeme
    this.literal = literal
    this.line = line
  }

  toString(): string {
    return this.type + " " + this.lexeme + " " + this.literal
  }
}
