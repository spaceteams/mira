import { watch } from 'chokidar'
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { parse } from 'path'
import { parseSchema, parseStatement } from '../../packages/parser'
import { Schema } from 'model'
import { generate } from '../../packages/codegen/src/codegen'

const basePath = './sql'

const dir = readdirSync(basePath)

const isSchemaFile = (f: string) => f === 'schema.sql'
const isSqlFile = (f: string) => f.endsWith('.sql')

const knownFiles = {
  schemaFiles: dir.filter(isSchemaFile).map((f) => `${basePath}/${f}`),
  sqlFiles: dir
    .filter((f) => isSqlFile(f) && !isSchemaFile(f))
    .map((f) => `${basePath}/${f}`),
}

const firstSchemaFile = knownFiles.schemaFiles[0]
let schema: Schema | undefined = firstSchemaFile
  ? parseSchema(readFileSync(firstSchemaFile).toString())
  : undefined

const watcher = watch(basePath)

function generateFile(file: string) {
  console.log('generate', file)
  if (schema === undefined) {
    return
  }
  const { name } = parse(file)
  const sql = readFileSync(file).toString()
  const statement = parseStatement(sql, schema)
  const code = generate(name, sql, statement)
  const codeFilename = file.substring(0, file.lastIndexOf('.')) + '.ts'
  writeFileSync(codeFilename, code)
}

watcher.on('change', (file) => {
  if (!isSqlFile(file)) {
    return
  }
  try {
    const { base } = parse(file)
    if (isSchemaFile(base)) {
      const sql = readFileSync(file).toString()
      schema = parseSchema(sql)
      for (const file of knownFiles.sqlFiles) {
        generateFile(file)
      }
    } else {
      generateFile(file)
    }
  } catch (e) {
    console.log(e)
  } finally {
  }
})
watcher.on('add', (file) => {
  if (!isSqlFile(file)) {
    return
  }
  try {
    const { base } = parse(file)
    if (isSchemaFile(base)) {
      const sql = readFileSync(file).toString()
      schema = parseSchema(sql)
      for (const file of knownFiles.sqlFiles) {
        generateFile(file)
      }
      knownFiles.schemaFiles.push(file)
    } else {
      generateFile(file)
      knownFiles.sqlFiles.push(file)
    }
  } catch (e) {
    console.log(e)
  } finally {
  }
})
