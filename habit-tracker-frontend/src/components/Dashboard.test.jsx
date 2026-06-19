import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from './Dashboard'

const baseProps = {
  user: { username: 'demo' },
  habits: [],
  loading: false,
  error: '',
  onAdd: vi.fn(),
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onLogout: vi.fn(),
}

const renderDashboard = (overrides = {}) =>
  render(<Dashboard {...baseProps} {...overrides} />)

describe('Dashboard (pure)', () => {
  it('greets the logged-in user', () => {
    renderDashboard({ user: { username: 'alex' } })
    expect(screen.getByText('Hi, alex')).toBeInTheDocument()
  })

  it('calls onLogout when the log out button is clicked', async () => {
    const onLogout = vi.fn()
    renderDashboard({ onLogout })
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it('shows a loading state and hides the habit list while loading', () => {
    renderDashboard({ loading: true })
    expect(screen.getByText('Loading habits…')).toBeInTheDocument()
    expect(screen.queryByText('No habits yet.')).not.toBeInTheDocument()
  })

  it('renders the empty state when there are no habits', () => {
    renderDashboard({ habits: [] })
    expect(screen.getByText('No habits yet.')).toBeInTheDocument()
  })

  it('renders an error message when provided', () => {
    renderDashboard({ error: 'Something went wrong' })
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders a row for each habit', () => {
    renderDashboard({
      habits: [
        { id: '1', name: 'Read', completions: {} },
        { id: '2', name: 'Run', completions: {} },
      ],
    })
    expect(screen.getByText('Read')).toBeInTheDocument()
    expect(screen.getByText('Run')).toBeInTheDocument()
  })

  it('calls onToggle with the habit id and a date when a day cell is clicked', async () => {
    const onToggle = vi.fn()
    renderDashboard({
      habits: [{ id: 'h1', name: 'Read', completions: {} }],
      onToggle,
    })

    // The 7 day cells are the toggle buttons (aria-pressed).
    const cells = screen.getAllByRole('button', { pressed: false })
    expect(cells).toHaveLength(7)
    await userEvent.click(cells[cells.length - 1]) // today

    expect(onToggle).toHaveBeenCalledTimes(1)
    const [habitId, date] = onToggle.mock.calls[0]
    expect(habitId).toBe('h1')
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('calls onDelete with the habit id when the delete button is clicked', async () => {
    const onDelete = vi.fn()
    renderDashboard({
      habits: [{ id: 'h1', name: 'Read', completions: {} }],
      onDelete,
    })

    await userEvent.click(screen.getByRole('button', { name: 'Delete Read' }))
    expect(onDelete).toHaveBeenCalledWith('h1')
  })
})
