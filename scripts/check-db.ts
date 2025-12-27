import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const moods = await prisma.mood.findMany({
    orderBy: { createdAt: 'desc' },
  })
  
  console.log(`\n📊 Total moods in database: ${moods.length}\n`)
  
  if (moods.length === 0) {
    console.log('❌ No moods found in database\n')
  } else {
    moods.forEach((mood, index) => {
      console.log(`${index + 1}. [${mood.rating}⭐] ${mood.text}`)
      console.log(`   📍 ${mood.placeName}`)
      if (mood.latitude && mood.longitude) {
        console.log(`   🗺️  Coordinates: ${mood.latitude}, ${mood.longitude}`)
      }
      console.log(`   📅 ${mood.createdAt.toLocaleString()}\n`)
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
