import { parseSelect } from './parse-select'
import { parseInsertReplace } from './parse-insert-replace'
import { parseDelete } from './parse-delete'
import { parseUpdate } from './parse-update'
import { AST } from 'node-sql-parser'
import { Schema, Statement } from 'model'

export function parseNode(node: AST, schema: Schema): Statement {
  switch (node.type) {
    case 'select': {
      return parseSelect(node, schema)
    }
    case 'replace':
    case 'insert': {
      return parseInsertReplace(node, schema)
    }
    case 'update': {
      return parseUpdate(node, schema)
    }
    case 'delete': {
      return parseDelete(node, schema)
    }
    default: {
      throw new Error(`${node.type} is not supported`)
    }
  }
}
