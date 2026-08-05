import { describe, it, expect } from 'vitest'
import { comics } from './comics.js'

describe('comics catalog', () => {
  it('has at least one comic', () => {
    expect(comics.length).toBeGreaterThan(0)
  })

  it('has unique ids and slugs', () => {
    const ids = comics.map((comic) => comic.id)
    const slugs = comics.map((comic) => comic.slug)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every comic has the required fields', () => {
    for (const comic of comics) {
      expect(comic.title).toBeTruthy()
      expect(comic.author).toBeTruthy()
      expect(comic.year).toBeTypeOf('number')
      expect(comic.pages).toBeTypeOf('number')
    }
  })
})
