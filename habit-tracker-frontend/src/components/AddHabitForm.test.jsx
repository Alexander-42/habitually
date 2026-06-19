import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddHabitForm from './AddHabitForm'

describe('AddHabitForm', () => {
  it('renders the preset quick-add chips', () => {
    render(<AddHabitForm onAdd={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Drink water/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Exercise/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Journal/ })).toBeInTheDocument()
  })

  it('calls onAdd with the preset name when a chip is clicked', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined)
    render(<AddHabitForm onAdd={onAdd} />)

    await userEvent.click(screen.getByRole('button', { name: /Drink water/ }))

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith('Drink water')
  })

  it('hides presets that are already in the habit list (case-insensitive)', () => {
    render(<AddHabitForm onAdd={vi.fn()} existingNames={['drink water']} />)
    expect(
      screen.queryByRole('button', { name: /Drink water/ })
    ).not.toBeInTheDocument()
    // Other presets remain available.
    expect(screen.getByRole('button', { name: /Exercise/ })).toBeInTheDocument()
  })

  it('submits a custom habit and clears the input', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined)
    render(<AddHabitForm onAdd={onAdd} />)

    const input = screen.getByLabelText('New habit name')
    await userEvent.type(input, '  Floss  ')
    await userEvent.click(screen.getByRole('button', { name: 'Add habit' }))

    expect(onAdd).toHaveBeenCalledWith('Floss') // trimmed
    expect(input).toHaveValue('')
  })

  it('does not call onAdd for an empty / whitespace custom value', async () => {
    const onAdd = vi.fn()
    render(<AddHabitForm onAdd={onAdd} />)

    const input = screen.getByLabelText('New habit name')
    await userEvent.type(input, '   ')
    await userEvent.click(screen.getByRole('button', { name: 'Add habit' }))

    expect(onAdd).not.toHaveBeenCalled()
  })

  it('shows an error message and keeps the input when onAdd rejects', async () => {
    const onAdd = vi.fn().mockRejectedValue(new Error('Habit name is required'))
    render(<AddHabitForm onAdd={onAdd} />)

    const input = screen.getByLabelText('New habit name')
    await userEvent.type(input, 'Stretch')
    await userEvent.click(screen.getByRole('button', { name: 'Add habit' }))

    expect(await screen.findByText('Habit name is required')).toBeInTheDocument()
    expect(input).toHaveValue('Stretch') // not cleared on failure
  })
})
