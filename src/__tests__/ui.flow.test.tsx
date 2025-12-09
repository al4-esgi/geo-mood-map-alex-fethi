import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MoodCapture } from '../presentation/MoodCapture'

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
    render(<MoodCapture />)

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
})

