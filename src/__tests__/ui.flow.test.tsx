import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MoodCapture } from '../presentation/MoodCapture'
import * as geoService from '../services/geolocationService'
import * as weatherService from '../services/weatherService'

describe('MoodCapture UI flow', () => {
  it('submits a mood and displays formatted summary with place and score', async () => {
    render(<MoodCapture />)

    fireEvent.change(screen.getByLabelText(/Mood text/i), {
      target: { value: 'happy day' },
    })
    fireEvent.change(screen.getByLabelText(/Rating/i), {
      target: { value: '4' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Save mood/i }))

    const item = await screen.findByText(/Mock Place/)
    expect(item).toBeDefined()
    expect(item.textContent).toMatch(/score=90/)
    expect(item.textContent).toMatch(/clouds 17°C/)
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

  it('accepts manual coordinates and uses them when fetching place/weather', async () => {
    const geoSpy = vi
      .spyOn(geoService, 'getPlaceByCoords')
      .mockResolvedValue({ lat: 40.0, lon: -74.0, name: 'NYC', type: 'city', source: 'mock' })
    const weatherSpy = vi
      .spyOn(weatherService, 'getWeatherByCoords')
      .mockResolvedValue({ lat: 40.0, lon: -74.0, condition: 'sun', temperature: 25, source: 'mock' })

    render(<MoodCapture initialCoords={{ lat: 40.0, lon: -74.0 }} />)

    fireEvent.change(screen.getByLabelText(/Mood text/i), {
      target: { value: 'custom coords' },
    })
    fireEvent.change(screen.getByLabelText(/Rating/i), {
      target: { value: '4' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Save mood/i }))

    const item = await screen.findByText(/NYC/)
    expect(item).toBeDefined()
    expect(geoSpy).toHaveBeenCalledWith({ lat: 40.0, lon: -74.0 })
    expect(weatherSpy).toHaveBeenCalledWith({ lat: 40.0, lon: -74.0 })

    geoSpy.mockRestore()
    weatherSpy.mockRestore()
  })

  it('uses browser geolocation when "Use my location" is clicked', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: /Use my location/i }))

    fireEvent.change(screen.getByLabelText(/Mood text/i), {
      target: { value: 'geo mood' },
    })
    fireEvent.change(screen.getByLabelText(/Rating/i), {
      target: { value: '3' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Save mood/i }))

    const item = await screen.findByText(/GeoPlace/)
    expect(item).toBeDefined()
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
})

