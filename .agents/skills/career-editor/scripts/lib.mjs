// Shared helpers for the career-editor scripts. Output is for the agent, not the client.
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))
export const LIVE_URL = 'https://career-managing.vercel.app'

/** Runs a command in the repo root without a shell (safe for Hebrew text in arguments). */
export function run(cmd, args, { show = false, shell = false } = {}) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    shell,
    stdio: show ? 'inherit' : 'pipe',
  })
  return { ok: result.status === 0, out: (result.stdout ?? '').trim(), err: (result.stderr ?? '').trim() }
}

export const git = (...args) => run('git', args)
export const npm = (...args) => run('npm', args, { show: true, shell: process.platform === 'win32' })

export function currentBranch() {
  return git('rev-parse', '--abbrev-ref', 'HEAD').out
}

/** Files with unpublished changes, as git status lines. */
export function changedFiles() {
  return git('status', '--porcelain').out.split('\n').filter(Boolean)
}

/** The highest edit number so far, from tags named edit-<n>. */
export function lastEditNumber() {
  const tags = git('tag', '--list', 'edit-*').out.split('\n').filter(Boolean)
  return tags.reduce((max, tag) => Math.max(max, Number(tag.slice(5)) || 0), 0)
}
