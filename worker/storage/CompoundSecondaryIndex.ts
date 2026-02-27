import type { Env } from '../types'
import { BaseSecondaryIndex } from './BaseSecondaryIndex'

export class CompoundSecondaryIndex extends BaseSecondaryIndex {
  static readonly entityName = 'sys-compound-secondary-index'
  protected readonly keyPrefix = 'compound:'

  constructor(env: Env, entityName: string, fieldNames: string[]) {
    const joinedFields = fieldNames.join(':')
    super(env, `compound-index:${entityName}:${joinedFields}`)
  }

  protected buildFieldKey(fieldValues: string[]): string {
    const joinedKey = fieldValues.join(':')
    return `compound:${joinedKey}:entity:`
  }

  protected buildFieldValueKey(fieldValues: string[], entityId: string): string {
    const joinedKey = fieldValues.join(':')
    return `compound:${joinedKey}:entity:${entityId}`
  }
}
