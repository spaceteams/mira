import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers'

let container: StartedPostgreSqlContainer
export async function setup() {
  container = await new PostgreSqlContainer().start()
  process.env.POSTGRES_CONNECTION_STRING = container.getConnectionUri()
}

export async function teardown() {
  await container.stop()
}
