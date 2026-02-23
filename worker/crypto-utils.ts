export function constantTimeCompare(a: string, b: string): boolean {
  const aBuffer = new TextEncoder().encode(a)
  const bBuffer = new TextEncoder().encode(b)

  const maxLen = Math.max(aBuffer.length, bBuffer.length)
  let result = aBuffer.length ^ bBuffer.length

  for (let i = 0; i < maxLen; i++) {
    const aByte = i < aBuffer.length ? aBuffer[i] : 0
    const bByte = i < bBuffer.length ? bBuffer[i] : 0
    result |= aByte ^ bByte
  }
  return result === 0
}
