import type { CSSProperties } from 'react'

export const GRADE_COLORS: Record<string, string> = {
  V0: '#e56a2e',
  V1: '#7a5e93',
  V2: '#fadb64',
  V3: '#ff006f',
  V4: '#f01a1c',
  V5: '#3586C4',
  V6: '#5fae4b',
  V7: '#6eb4b7',
  V8: '#ae42c8',
  V9: '#F2F2EE',
  V10: '#1a1a1a',
  V11: '#9ACD32',
  V12: '#2FA7A0',
  'V12+': '#2FA7A0',
}

export function getGradeColor(grade: string): string {
  return GRADE_COLORS[grade] ?? '#6b7280'
}

export function gradeBadgeStyle(grade: string | null | undefined): CSSProperties {
  const color = getGradeColor(grade ?? '')
  return {
    backgroundColor: color + '2E',
    border: `1.5px solid ${color}`,
    color: '#1a1a1a',
  }
}
