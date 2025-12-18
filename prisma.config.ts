import 'dotenv/config'
import { defineConfig } from '@prisma/config'

const datasourceUrl = process.env.DATABASE_URL

if (!datasourceUrl) {
  throw new Error('DATABASE_URL env var is not set')
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: datasourceUrl,
  },
})
