export const crops = [
  {
    name: 'Maize',
    aliases: ['corn'],
    description: 'A warm-season grain crop grown for food, feed, and many everyday products.',
    planting: 'Plant after frost in warm, well-drained soil with full sun. Space rows so plants have room for pollination.',
    maturity: 'About 70-120 days, depending on variety and growing conditions.',
    water: 'About 25-50 mm per week; keep moisture steady during tasseling and ear development.',
  },
  {
    name: 'Tomato',
    aliases: [],
    description: 'A productive warm-season crop that grows well in a sunny spot with support.',
    planting: 'Transplant after frost into fertile, well-drained soil. Provide full sun and stake or cage the plants.',
    maturity: 'About 60-85 days after transplanting, depending on variety.',
    water: 'About 25-38 mm per week; water at the base and aim for consistent soil moisture.',
  },
  {
    name: 'Onion',
    aliases: [],
    description: 'A cool-season bulb crop that stores well when harvested and cured properly.',
    planting: 'Plant sets or seedlings in loose, fertile soil in full sun. Keep the area weed-free while bulbs develop.',
    maturity: 'About 90-120 days, depending on variety and whether grown from sets or seed.',
    water: 'About 25 mm per week; reduce watering as tops begin to fall before harvest.',
  },
  {
    name: 'Wheat',
    aliases: [],
    description: 'A widely grown cereal grain used for flour, food, and livestock feed.',
    planting: 'Sow into a firm, well-drained seedbed. Choose a locally suitable spring or winter variety.',
    maturity: 'About 100-120 days for many spring varieties; winter wheat takes longer overall.',
    water: 'Around 25 mm per week when rainfall is limited, especially during heading and grain fill.',
  },
  {
    name: 'Potato',
    aliases: [],
    description: 'A cool-season tuber crop that develops best in loose soil with room for tubers to expand.',
    planting: 'Plant seed potatoes in loose, well-drained soil. Hill soil around stems as plants grow.',
    maturity: 'About 70-120 days, depending on whether the variety is early, midseason, or late.',
    water: 'About 25-50 mm per week; keep moisture even while tubers form and enlarge.',
  },
  {
    name: 'Cabbage',
    aliases: [],
    description: 'A leafy cool-season crop that forms firm heads in fertile soil and mild weather.',
    planting: 'Transplant into fertile, moisture-retentive soil in full sun. Allow enough spacing for heads to form.',
    maturity: 'About 70-100 days after transplanting, depending on variety.',
    water: 'About 25-38 mm per week; steady moisture helps heads develop evenly.',
  },
]

export function findCropByName(query) {
  const normalizedQuery = query.trim().replace(/\s+/g, ' ').toLowerCase()

  if (!normalizedQuery) {
    return undefined
  }

  return crops.find((crop) =>
    [crop.name, ...crop.aliases].some((name) => name.toLowerCase() === normalizedQuery),
  )
}