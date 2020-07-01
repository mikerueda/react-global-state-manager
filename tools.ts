import { Action, Reducers } from './types'

export const defer = (fn: () => void) => {
  let timerHandler: number

  return () => {
    window.clearTimeout(timerHandler)
    timerHandler = window.setTimeout(fn, 0)
  }
}

export const hasChanged = (a: {}, b: {}) =>
  JSON.stringify(a) !== JSON.stringify(b)

export const logAction = <S, R extends Reducers<S>>(storeName: string) => (
  nextStore: S,
  prevStore: S,
  action: Action<S, R>
) => {
  console.groupCollapsed(
    '%c%s',
    'font-size: 14px; font-weight: bold;',
    `${action.name}@${storeName}`
  )
  console.log(
    '%c%s',
    'color: #bfbfbf; font-weight: bold;',
    'previous-store:',
    prevStore
  )
  console.log(
    '%c%s',
    'color: #008fef; font-weight: bold;',
    'payload:',
    ...action.payload
  )
  console.log(
    '%c%s',
    'color: #00ef8f; font-weight: bold;',
    'next-store:',
    nextStore
  )
  console.groupEnd()
}

export const log = <Args extends any[], R>(
  target: (...args: Args) => R,
  logger?: (output: R, ...params: Args) => void
) => {
  if (!logger) {
    return target
  }
  return (...args: Args): R => {
    const result = target(...args)
    logger(result, ...args)
    return result
  }
}
