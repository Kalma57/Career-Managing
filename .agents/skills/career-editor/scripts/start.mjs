// Run at the start of every conversation: gets the latest version and reports the state.
// Usage: node .agents/skills/career-editor/scripts/start.mjs
import { existsSync } from 'node:fs'
import { ROOT, changedFiles, currentBranch, git, lastEditNumber, npm } from './lib.mjs'

const branch = currentBranch()
console.log(`BRANCH: ${branch}`)

const pending = changedFiles()
if (pending.length) {
  // Don't pull over unpublished work; the skill asks the client what to do with it.
  console.log(`UNPUBLISHED_CHANGES:\n${pending.join('\n')}`)
} else {
  git('fetch', '--tags', '--quiet')
  if (!git('rev-parse', '--abbrev-ref', '@{upstream}').ok) {
    console.log('NO_UPSTREAM (local branch, nothing to pull)')
  } else {
    const pull = git('pull', '--ff-only', '--quiet')
    console.log(pull.ok ? 'UP_TO_DATE' : `PULL_FAILED: ${pull.err}`)
  }
}

if (!existsSync(`${ROOT}node_modules`)) {
  console.log('INSTALLING_DEPENDENCIES')
  if (!npm('install').ok) console.log('INSTALL_FAILED')
}

console.log(`LAST_EDIT_NUMBER: ${lastEditNumber()}`)
