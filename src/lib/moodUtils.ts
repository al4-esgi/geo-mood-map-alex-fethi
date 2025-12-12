export function getMoodEmoji(rating: number) {
  if (rating >= 5) return '😄'
  if (rating >= 4) return '🙂'
  if (rating >= 3) return '😐'
  if (rating >= 2) return '😕'
  return '😢'
}
