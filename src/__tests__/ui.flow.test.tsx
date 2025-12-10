import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MoodCapture } from '../presentation/MoodCapture'
import * as geoService from '../services/geolocationService'
import * as weatherService from '../services/weatherService'
import { loadMoods, moodStore } from '../state/moodStore'
import { act } from 'react'

describe('MoodCapture UI flow', () => {
  beforeEach(() => {
    moodStore.setState([])
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
    const originalGeo = navigator.geolocation
    const geoMock = {
      getCurrentPosition: (success: PositionCallback) =>
        success({
          coords: {
            latitude: 48.8566,
            longitude: 2.3522,
            accuracy: 0,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON() {
              return this
            },
          },
          timestamp: Date.now(),
          toJSON() {
            return this
          },
        }),
    } as Geolocation
    // @ts-expect-error override for tests
    navigator.geolocation = geoMock

    return () => {
      // @ts-expect-error restore
      navigator.geolocation = originalGeo
    }
  })

  it('submits a mood and displays formatted summary with place and score', async () => {
    render(<MoodCapture />)

    fireEvent.change(screen.getByLabelText(/Mood text/i), {
      target: { value: 'happy day' },
    })
    fireEvent.change(screen.getByLabelText(/Rating/i), {
      target: { value: '4' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Save mood/i }))

    const items = await screen.findAllByRole('listitem')
    const text = items[0].textContent ?? ''
    expect(text).toMatch(/Mock Place/)
    expect(text).toMatch(/Score\s*\d+/)
    expect(text).toMatch(/clouds 17°C/)
  })

  it('stores multiple entries in insertion order', async () => {
    render(<MoodCapture persistence="memory" />)

    const textField = screen.getByLabelText(/Mood text/i)
    const ratingField = screen.getByLabelText(/Rating/i)
    const submitBtn = screen.getByRole('button', { name: /Save mood/i })

    // First entry
    fireEvent.change(textField, { target: { value: 'first mood' } })
    fireEvent.change(ratingField, { target: { value: '3' } })
    fireEvent.click(submitBtn)
    await screen.findByText(/first mood/)
    await waitFor(() => expect((submitBtn as HTMLButtonElement).disabled).toBe(false))

    // Second entry
    fireEvent.change(textField, { target: { value: 'second mood' } })
    fireEvent.change(ratingField, { target: { value: '5' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      const items = screen.getAllByRole('listitem')
      expect(items).toHaveLength(2)
      expect(items[0].textContent).toMatch(/first mood/)
      expect(items[1].textContent).toMatch(/second mood/)
    })
  })

  it('auto geolocation uses fetched coords when saving', async () => {
    const geoSpy = vi
      .spyOn(geoService, 'getPlaceByCoords')
      .mockResolvedValue({ lat: 48.8566, lon: 2.3522, name: 'AutoPlace', type: 'city', source: 'mock' })
    const weatherSpy = vi
      .spyOn(weatherService, 'getWeatherByCoords')
      .mockResolvedValue({ lat: 48.8566, lon: 2.3522, condition: 'sun', temperature: 20, source: 'mock' })

    render(<MoodCapture />)

    fireEvent.change(screen.getByLabelText(/Mood text/i), {
      target: { value: 'auto coords' },
    })
    fireEvent.change(screen.getByLabelText(/Rating/i), {
      target: { value: '4' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Save mood/i }))

    await waitFor(() => {
      expect(geoSpy).toHaveBeenCalledWith({ lat: 48.8566, lon: 2.3522 })
      expect(weatherSpy).toHaveBeenCalledWith({ lat: 48.8566, lon: 2.3522 })
    })

    geoSpy.mockRestore()
    weatherSpy.mockRestore()
  })

  it('refresh location uses browser geolocation', async () => {
    const geoSpy = vi
      .spyOn(geoService, 'getPlaceByCoords')
      .mockResolvedValue({ lat: 10, lon: 20, name: 'GeoPlace', type: 'city', source: 'mock' })
    const weatherSpy = vi
      .spyOn(weatherService, 'getWeatherByCoords')
      .mockResolvedValue({ lat: 10, lon: 20, condition: 'clouds', temperature: 19, source: 'mock' })

    const geoMock = {
      getCurrentPosition: (success: PositionCallback) =>
        success({
          coords: {
            latitude: 10,
            longitude: 20,
            accuracy: 0,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON() {
              return this
            },
          },
          timestamp: Date.now(),
          toJSON() {
            return this
          },
        }),
    } as Geolocation
    const originalGeo = navigator.geolocation
    // @ts-expect-error allow override for test
    navigator.geolocation = geoMock

    render(<MoodCapture />)

    const refreshBtn = await screen.findByRole('button', { name: /Refresh location/i })
    fireEvent.click(refreshBtn)

    fireEvent.change(screen.getByLabelText(/Mood text/i), {
      target: { value: 'geo mood' },
    })
    fireEvent.change(screen.getByLabelText(/Rating/i), {
      target: { value: '3' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Save mood/i }))

    const items = await screen.findAllByText(/GeoPlace/)
    expect(items.length).toBeGreaterThan(0)
    expect(geoSpy).toHaveBeenCalledWith({ lat: 10, lon: 20 })
    expect(weatherSpy).toHaveBeenCalledWith({ lat: 10, lon: 20 })

    geoSpy.mockRestore()
    weatherSpy.mockRestore()
    // @ts-expect-error restore
    navigator.geolocation = originalGeo
  })

  it('persists entries across remounts when using localStorage store', async () => {
    render(<MoodCapture persistence="localStorage" storageKey="ui-flow-test" />)

    fireEvent.change(screen.getByLabelText(/Mood text/i), {
      target: { value: 'persisted mood' },
    })
    fireEvent.change(screen.getByLabelText(/Rating/i), {
      target: { value: '4' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Save mood/i }))

    await screen.findByText(/persisted mood/)

    // Unmount/remount by re-rendering
    render(<MoodCapture persistence="localStorage" storageKey="ui-flow-test" />)

    const items = await screen.findAllByRole('listitem')
    expect(items.some((item) => item.textContent?.includes('persisted mood'))).toBe(true)
  })

  it('hydrates from store on mount using localStorage data', async () => {
    // Preload store via persistence helper
    await loadMoods('localStorage', 'ui-flow-preload')
    // Manually set state to simulate pre-existing entry
    const existing = [
      {
        id: '1',
        text: 'preloaded',
        rating: 3,
        score: 70,
        placeName: 'Paris',
        weatherSummary: 'cloudy 17°C',
        createdAt: new Date(),
      },
    ]
    act(() => moodStore.setState(existing))

    render(<MoodCapture persistence="localStorage" storageKey="ui-flow-preload" />)

    const items = await screen.findAllByRole('listitem')
    expect(items.some((item) => item.textContent?.includes('preloaded'))).toBe(true)
  })

  it('captures an image file and stores its data URL path in the list', async () => {
    // Mock mediaDevices
    // @ts-expect-error mock mediaDevices
    navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    }
    // Mock canvas context/toDataURL
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      drawImage: vi.fn(),
      // minimal 2d context methods used
    }) as any
    const originalToDataUrl = HTMLCanvasElement.prototype.toDataURL
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,test')
    // Mock video play
    const originalPlay = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)

    render(<MoodCapture persistence="localStorage" storageKey="photo-test" />)

    fireEvent.click(screen.getByRole('button', { name: /Start camera/i }))
    fireEvent.click(screen.getByRole('button', { name: /Take photo/i }))

    fireEvent.change(screen.getByLabelText(/Mood text/i), {
      target: { value: 'with photo' },
    })
    fireEvent.change(screen.getByLabelText(/Rating/i), {
      target: { value: '4' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Save mood/i }))

    const items = await screen.findAllByRole('listitem')
    const last = items[items.length - 1]
    const text = last?.textContent ?? ''
    expect(text).toMatch(/with photo/)
    const dataImg = last?.querySelector('img[src^="data:image/png"]')
    expect(dataImg).toBeTruthy()

    // restore mocks
    HTMLCanvasElement.prototype.getContext = originalGetContext
    HTMLCanvasElement.prototype.toDataURL = originalToDataUrl
    HTMLMediaElement.prototype.play = originalPlay
  })
})

