// "להתחיל מחדש": throws away changes that were not published yet. Published edits are untouched.
// Only run after the client confirmed.
// Usage: node .agents/skills/career-editor/scripts/discard.mjs
import { changedFiles, git } from './lib.mjs'

const files = changedFiles()
if (!files.length) {
  console.log('NOTHING_TO_DISCARD')
  process.exit(0)
}
git('restore', '--staged', '--worktree', '--', '.')
git('clean', '-fdq', '--', 'src') // new files the edit added under src/ only
console.log(`DISCARDED:\n${files.join('\n')}`)
