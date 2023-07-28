import { workspaces } from './package.json'

export default workspaces.map((path) => `${path}/vitest.config.ts`)
