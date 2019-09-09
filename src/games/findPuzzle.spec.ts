import { createFindPuzzleLevel } from 'db/seeds/seed-everything'
import { CellStates, FindPuzzleSolution, FindPuzzleSolutionData, reducer, SolutionStates } from './findPuzzle'

const createSolution = (data: FindPuzzleSolutionData): FindPuzzleSolution => ({
  history: [],
  levelId: 'dummy',
  playerId: 'dummy',
  state: SolutionStates.unchanged,
  data,
})

const createSolutionData = (size: number = 4): FindPuzzleSolutionData => createFindPuzzleLevel('TEST', size)

describe('Game:Find Puzzle', () => {
  let solution: FindPuzzleSolution = null

  beforeEach(() => (solution = createSolution(createSolutionData())))

  const expectChanges = (next: FindPuzzleSolution) => {
    expect(solution.history).not.toEqual(next.history)
    expect(solution.data.actions).toEqual(next.data.actions)
    expect(solution.data.colHints).toEqual(next.data.colHints)
    expect(solution.data.rowHints).toEqual(next.data.rowHints)
    expect(solution.data.cols).toEqual(next.data.cols)
    expect(solution.data.rows).toEqual(next.data.rows)
    expect(solution.data.index).not.toEqual(next.data.index)
  }

  it('should not change the level!', () => expect(solution).toMatchSnapshot())
  it('should generate lvl 3', () => expect(createSolution(createSolutionData(3))).toMatchSnapshot())
  it('should generate lvl 2', () => expect(createSolution(createSolutionData(2))).toMatchSnapshot())

  it('', () => console.log(solution))

  it('should handle cellToEmpty actions correctly', () => {
    const next = reducer(solution, {
      type: 'cellToEmpty',
      payload: {
        index: 0,
      },
    })
    expectChanges(next)
    expect(solution.data.index.slice(1)).toEqual(next.data.index.slice(1))
    expect(next.data.index[0]).toEqual(CellStates.empty)
    expect(next.history).toHaveLength(1)
  })

  it('should handle cellToUnkown actions correctly', () => {
    const next = reducer(solution, {
      type: 'cellToEmpty',
      payload: {
        index: 0,
      },
    })
    const nextNext = reducer(next, {
      type: 'cellToUnknown',
      payload: {
        index: 0,
      },
    })
    expectChanges(next)
    expect(solution.data).toEqual(nextNext.data)
    expect(nextNext.history).toHaveLength(2)
    expect(nextNext.data.index[0]).toEqual(CellStates.unknown)
  })

  it('should handle cellToEmpty actions correctly', () => {
    const next = reducer(solution, {
      type: 'cellToRabbit',
      payload: {
        index: 0,
      },
    })
    expectChanges(next)
    expect(next.history).toHaveLength(1)
    expect(solution.data.index.slice(1)).toEqual(next.data.index.slice(1))
    expect(next.data.index[0]).toEqual(CellStates.target)
  })
})

describe('Winning and Loosing', () => {
  let solution: FindPuzzleSolution = null
  beforeEach(() => (solution = createSolution(createSolutionData(2))))

  it('should solve an easy puzzle', () => {
    const step1 = reducer(solution, {
      type: 'cellToEmpty',
      payload: { index: 0 },
    })
    const step2 = reducer(step1, {
      type: 'cellToEmpty',
      payload: { index: 2 },
    })
    const step3 = reducer(step2, {
      type: 'cellToRabbit',
      payload: { index: 3 },
    })
    // unchanged, active, active, won
    expect([solution, step1, step2, step3].map(s => s.state)).toEqual([0, 1, 1, 2])
  })
})
