import { TokenType } from "./tokenType"

export interface Token {
  type: TokenType
  lexeme: string
  literal?: any
  line: number
}
