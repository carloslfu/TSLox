import fs from "fs"
import inquirer from "inquirer"
import { AstPrinter } from "./astPrinter"
import { BinaryExpression, LiteralExpression } from "./expression"
import { Scanner } from "./scanner"
import { Token } from "./token"
import { TokenType } from "./tokenType"

main()

function main() {
  const args = process.argv.slice(2)

  if (args.length > 1) {
    console.log("Usage: npm start [script]")
    process.exit(64)
  } else if (args.length == 1) {
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
  // const scanner = new Scanner(code)
  // const tokens = scanner.scanTokens()

  // console.log("Tokens: ", tokens)

  const astPrinter = new AstPrinter()

  const codeStr = astPrinter.print(
    new BinaryExpression(
      new LiteralExpression(12),
      new Token(TokenType.PLUS, "+", null, 1),
      new LiteralExpression(5),
    ),
  )

  console.log(codeStr)
}
