import fs from "fs"
import inquirer from "inquirer"
import { AstPrinter } from "./astPrinter"
import { BinaryExpression, LiteralExpression } from "./expression"
import { Parser } from "./parser"
import { Scanner } from "./scanner"
import { Token } from "./token"
import { TokenType } from "./tokenType"

main()

function main() {
  const args = process.argv.slice(2)

  if (args.length > 1) {
    console.log("Usage: npm start [script]")
    process.exit(64)
  } else if (args.length === 1) {
    runFile(args[0])
  } else {
    runPrompt()
  }
}

function runFile(path: string) {
  if (!fs.existsSync(path)) {
    console.log(`The file "${path}" doesn't exist`)
    return
  }

  const code = fs.readFileSync(path, "utf-8").toString()
  run(code)
}

async function runPrompt() {
  while (true) {
    const result: any = await inquirer.prompt({ name: "code", message: " ", prefix: ">" })

    await run(result.code)
  }
}

async function run(code: string) {
  const scanner = new Scanner(code)
  const tokens = scanner.scanTokens()
  console.log("tokens", tokens)
  const parser = new Parser(tokens)
  const expression = parser.parse()
  console.log("expression", expression)
  const astPrinter = new AstPrinter()
  const astStr = astPrinter.print(expression)

  console.log(astStr)
}
