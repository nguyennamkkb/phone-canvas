/**
 * Spec IR v1 envelope builder (E5, additive).
 *
 * `buildSpec` keeps returning the bare node list — every existing caller
 * (InspectorContext, locate, copy-json) is untouched. New producers that want
 * the versioned envelope call this; old readers keep destructuring only the
 * fields they know, so unknown future fields never break them.
 */

import { IR_VERSION, type SpecIR, type SpecNode } from './types.ts'

export { IR_VERSION }

export function buildSpecIR(input: Omit<SpecIR, 'irVersion'>): SpecIR {
  return { irVersion: IR_VERSION, ...input }
}

export type { SpecIR, SpecNode }
