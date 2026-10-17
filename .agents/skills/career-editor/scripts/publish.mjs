// Checks the change, saves it as a numbered edit and publishes it.
// Usage: node .agents/skills/career-editor/scripts/publish.mjs "<short Hebrew description>"
//
// On main: commit "עריכה #N: <description>", tag edit-N, push → the live site updates in about a minute.
// On any other branch (testing): commit "[בדיקה – <branch>] <description>", push the branch, no tag.
// Exit codes: 1 usage, 2 blocked files, 3 tests failed, 4 build failed, 5 push failed.
import { LIVE_URL, changedFiles, currentBranch, git, lastEditNumber, npm } from './lib.mjs'

const description = process.argv.slice(2).join(' ').trim()
if (!description) {
  console.log('USAGE: publish.mjs "<short Hebrew description>"')
  process.exit(1)
}

// Content edits never need these; a change here means something went wrong.
const BLOCKED = [/^\.env/, /^api\//, /^server\//, /^src\/engine\//, /^\.agents\//, /package(-lock)?\.json$/, /^vite\.config/, /^tsconfig/, /\.test\.ts$/]
const files = changedFiles().map((line) => line.slice(3).replace(/^"|"$/g, ''))
const blocked = files.filter((f) => BLOCKED.some((re) => re.test(f)))
if (blocked.length) {
  console.log(`BLOCKED: these files must not change in a content edit:\n${blocked.join('\n')}`)
  process.exit(2)
}

const branch = currentBranch()
const onMain = branch === 'main'

if (files.length) {
  console.log('RUNNING_TESTS')
  if (!npm('test').ok) {
    console.log('TESTS_FAILED')
    process.exit(3)
  }
  console.log('RUNNING_BUILD')
  if (!npm('run', 'build').ok) {
    console.log('BUILD_FAILED')
    process.exit(4)
  }

  git('fetch', '--tags', '--quiet')
  const number = lastEditNumber() + 1
  const message = onMain ? `עריכה #${number}: ${description}` : `[בדיקה – ${branch}] ${description}`
  git('add', '-A')
  const commit = git('commit', '-q', '-m', message)
  if (!commit.ok) {
    console.log(`COMMIT_FAILED: ${commit.err || commit.out}`)
    process.exit(5)
  }
  if (onMain) git('tag', `edit-${number}`)
  console.log(onMain ? `EDIT_NUMBER: ${number}` : 'TEST_COMMIT (not numbered)')
} else {
  // Nothing new; maybe an earlier publish was saved but its push failed.
  const ahead = git('rev-list', '--count', `origin/${branch}..HEAD`)
  if (!ahead.ok || ahead.out === '0') {
    console.log('NOTHING_TO_PUBLISH')
    process.exit(0)
  }
  console.log('RETRYING_PUSH')
}

const push = onMain ? git('push', '--quiet', 'origin', 'main', '--tags') : git('push', '--quiet', '-u', 'origin', branch)
if (!push.ok) {
  console.log(`PUSH_FAILED: ${push.err}`)
  process.exit(5)
}
console.log(onMain ? `PUBLISHED: ${LIVE_URL} (live in about a minute)` : `PUBLISHED_TEST_BRANCH: ${branch} (Vercel builds a preview link for it)`)
