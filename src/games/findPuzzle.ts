import { CreateGameSolution } from 'db/models'

export enum CellStates {
  empty,
  target,
  hint,
  unknown,
}

export enum SolutionStates {
  unchanged,
  active,
  won,
  lost,
}

export interface Action<Types extends string = string, Payload = any> {
  type: Types
  payload: Payload
}

/** Checks if the action has a valid FindPuzzleAction type */
export const isValidFindPuzzleAction = (action: Action): action is FindPuzzleAction =>
  ['cellToEmpty', 'cellToUnknown', 'cellToRabbit'].includes(action.type)

/** Generator to create a isAction guard */
export const isActionType = <ActionType extends Action>(type: string) => (action: Action): action is ActionType =>
  action.type === type

export type FindPuzzleActionCellToEmpty = Action<'cellToEmpty', { index: number }>
export const isFindPuzzleActionCellToEmpty = isActionType<FindPuzzleActionCellToEmpty>('cellToEmpty')

export type FindPuzzleActionCellToUnknown = Action<'cellToUnknown', { index: number }>
export const isFindPuzzleActionCellToUnknown = isActionType<FindPuzzleActionCellToUnknown>('cellToUnknown')

export type FindPuzzleActionCellToTarget = Action<'cellToRabbit', { index: number }>
export const isFindPuzzleActionCellToTarget = isActionType<FindPuzzleActionCellToTarget>('cellToRabbit')

export type FindPuzzleAction =
  | FindPuzzleActionCellToEmpty
  | FindPuzzleActionCellToUnknown
  | FindPuzzleActionCellToTarget

export interface FindPuzzleSolutionData {
  index: CellStates[]
  actions: string[]
  cols: number
  rows: number
  rowHints: number[]
  colHints: number[]
}

export interface FindPuzzleHistory {
  action: FindPuzzleAction
}

export interface FindPuzzleSolution extends CreateGameSolution {
  history: FindPuzzleHistory[]
  data: FindPuzzleSolutionData
  state: SolutionStates
}

export const isValidIndex = (solution: FindPuzzleSolution, index: number) =>
  index >= 0 && index < solution.data.index.length

/** checks if a cellstate change is valid */
export const validateCellStateChange = (solution: FindPuzzleSolution, index: number, validCellStates: CellStates[]) => {
  if (!isValidIndex(solution, index)) return false
  const currentIndex = solution.data.index[index]
  if (!validCellStates.includes(currentIndex)) return false
  return true
}

/** changes a specific index to a different cellstate */
export const updateCellState = (
  solutionData: FindPuzzleSolutionData,
  index: number,
  cellState: CellStates,
): FindPuzzleSolutionData => ({
  ...solutionData,
  index: [...solutionData.index.slice(0, index), cellState, ...solutionData.index.slice(index + 1)],
})

/** Finds the number of target values in a array of CellStates */
export const indexToTargetNumber = (index: CellStates[]) => index.filter(state => state === CellStates.target).length

/** Generates a function that sums up all targets for a given row */
export const getIndexRow = (cols: number, rows: number, index: CellStates[]) => (row: number) =>
  indexToTargetNumber(index.filter((state, index) => row === index % rows))

/** Generates a function that sums up all targets for a given column */
export const getIndexCol = (cols: number, rows: number, index: CellStates[]) => (col: number) => {
  const [lower, upper] = [rows * col, rows * (col + 1)]
  return indexToTargetNumber(index.filter((state, index) => lower <= index && index < upper))
}

/**
 * Runs through a solution and determines the solutions state
 * - if not history, no actions were taken => unchanged
 * - if no field is unknown...
 *   - if all row-hints and col-hints are correct in their numbers => won
 *   - else => lost
 * - else => active
 */
export const resolveState = (solution: FindPuzzleSolution) => {
  if (!solution.history.length) return SolutionStates.unchanged

  if (!solution.data.index.filter(state => state === CellStates.unknown).length) {
    const indexRow = getIndexRow(solution.data.cols, solution.data.rows, solution.data.index)
    const indexCol = getIndexCol(solution.data.cols, solution.data.rows, solution.data.index)
    return solution.data.rowHints
      .map((hint, row) => hint === indexRow(row))
      .concat(solution.data.colHints.map((hint, col) => hint === indexCol(col)))
      .filter(correct => !correct).length
      ? SolutionStates.lost
      : SolutionStates.won
  }

  return SolutionStates.active
}

/** checks the solution for its current state */
export const check = (solution: FindPuzzleSolution): FindPuzzleSolution => {
  return {
    ...solution,
    state: resolveState(solution),
  }
}

/** resolves a solution for an change-board action */
export const reduceChangeAction = (
  solution: FindPuzzleSolution,
  action: FindPuzzleAction,
  validCellStates: CellStates[],
  newCellState: CellStates,
): FindPuzzleSolution =>
  !validateCellStateChange(solution, action.payload.index, validCellStates)
    ? solution
    : check({
        ...solution,
        data: updateCellState(solution.data, action.payload.index, newCellState),
        history: [...solution.history, { action }],
      })

/** resolves all FindPuzzleActions */
export const reducer = (solution: FindPuzzleSolution, action: FindPuzzleAction) => {
  if (!isValidFindPuzzleAction(action)) return solution // never
  if (isFindPuzzleActionCellToEmpty(action))
    return reduceChangeAction(solution, action, [CellStates.unknown, CellStates.target], CellStates.empty)
  if (isFindPuzzleActionCellToTarget(action))
    return reduceChangeAction(solution, action, [CellStates.unknown, CellStates.empty], CellStates.target)
  if (isFindPuzzleActionCellToUnknown(action))
    return reduceChangeAction(solution, action, [CellStates.empty, CellStates.target], CellStates.unknown)
  return solution // never
}
