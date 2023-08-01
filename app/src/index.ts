import { watch } from 'chokidar'
import { readFileSync, writeFileSync } from 'fs'
import { parse } from 'path'
import { parseSchema, parseStatement } from '../../packages/parser'
import { Schema } from 'model'
import { generate, generateRaw } from 'codegen'
import yargs from 'yargs'
import { globSync } from 'glob'

async function parseArgumentsAndRun() {
  const args = await yargs(process.argv)
    .pkgConf('sql-node-delight')
    .option('sql', {
      alias: 's',
      type: 'string',
      description:
        'The glob pattern to the sql files (the statements that your code uses)',
      demandOption: true,
    })
    .option('migrations', {
      alias: 'm',
      type: 'string',
      description:
        'The glob pattern to the migrations files (the schema files that are used for type inference)',
      demandOption: true,
    })
    .option('watch', {
      alias: 'w',
      type: 'boolean',
      description: 'Run in watch mode',
      default: false,
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Log more info',
      default: false,
    })
    .option('dialect', {
      alias: 'd',
      type: 'string',
      choices: ['postgresql', 'sqlite'],
      description: 'The SQL Dialect to use',
      default: 'postgresql',
    })
    .option('client', {
      alias: 'c',
      type: 'string',
      description: 'Use your own client library instead of the packaged',
    })
    .parse()

  run(args)
}
parseArgumentsAndRun()

type Arguments = {
  sql: string
  migrations: string
  watch: boolean
  verbose: boolean
  dialect: string
  client?: string
}
function run(args: Arguments) {
  regenerateAllStatements()

  if (args.watch) {
    args.verbose && console.log('watching', args.migrations, 'and', args.sql)
    const isSqlFile = (f: string) => f.endsWith('.sql')
    watch(args.migrations, { ignoreInitial: true })
      .on('add', regenerateAllStatements)
      .on('change', regenerateAllStatements)
      .on('unlink', regenerateAllStatements)
    watch(args.sql, { ignoreInitial: true })
      .on('add', (file) => {
        if (!isSqlFile(file)) {
          return
        }
        const schema = buildSchema()
        generateFile(file, schema)
      })
      .on('change', (file) => {
        if (!isSqlFile(file)) {
          return
        }
        const schema = buildSchema()
        generateFile(file, schema)
      })
  }

  function regenerateAllStatements() {
    args.verbose && console.log('regenerating')
    const schema = buildSchema()
    const sqlFiles = globSync(args.sql)
    for (const file of sqlFiles) {
      generateFile(file, schema)
    }
  }
  function buildSchema(): Schema | undefined {
    const files = globSync(args.migrations)
    args.verbose && console.log('migration files found', files)
    files.sort()
    let schema: Schema | undefined = undefined
    for (const file of files) {
      try {
        schema = parseSchema(readFileSync(file).toString(), schema)
      } catch (e) {
        if (e instanceof Error) {
          console.error(`error: ${e.message} in ${file}`)
        } else {
          throw e
        }
      }
    }
    args.verbose &&
      console.log(
        'schema built successfully. Found tables: ',
        schema?.tables.map((t) => t.name),
      )
    return schema
  }
  function generateFile(file: string, schema: Schema | undefined) {
    args.verbose && console.log('generate', file)
    if (schema === undefined) {
      return
    }
    const { name } = parse(file)
    const sql = readFileSync(file).toString()
    let code
    try {
      const statement = parseStatement(sql, schema)
      code = generate(name, sql, statement, args.dialect, args.client)
    } catch (e) {
      if (e instanceof Error) {
        code = generateRaw(name, sql, args.dialect, args.client)
        console.error('error during sql file generation', file, e.message)
      } else {
        throw e
      }
    }
    const codeFilename = file.substring(0, file.lastIndexOf('.')) + '.ts'
    writeFileSync(codeFilename, code)
  }
}
