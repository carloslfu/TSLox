import fs from "fs"
import inquirer from "inquirer"
import { AstPrinter } from "./astPrinter"
import { Interpreter } from "./interpreter"
import { Parser } from "./parser"
import { Scanner } from "./scanner"
import { VariableDeclarationStatement } from "./statement"

export class Lox {
  hadError = false

  interpreter = new Interpreter()

  main() {
    const args = process.argv.slice(2)

    if (args.length > 1) {
      console.log("Usage: npm start [script]")
      process.exit(64)
    } else if (args.length === 1) {
      this.runFile(args[0])
    } else {
      this.runPrompt()
    }
  }

  runFile(path: string) {
    if (!fs.existsSync(path)) {
      console.log(`The file "${path}" doesn't exist`)
      return
    }

    const code = fs.readFileSync(path, "utf-8").toString()
    this.run(code)

    if (this.hadError) {
      process.exit(65)
    }

    if (this.interpreter.hadRuntimeError) {
      process.exit(70)
    }
  }

  async runPrompt() {
    while (true) {
      const result: any = await inquirer.prompt({ name: "code", message: " ", prefix: ">" })

      await this.run(result.code)
    }
  }

  async run(code: string) {
    const scanner = new Scanner(code)
    const tokens = scanner.scanTokens()

    const parser = new Parser(tokens)
    const statements = parser.parse()

    // console.log(JSON.stringify(tokens, null, 2))

    this.interpreter.interpret(statements)
  }
}

const lox = new Lox()

lox.main()
