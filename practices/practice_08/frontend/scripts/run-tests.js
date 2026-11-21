import { spawnSync } from 'node:child_process'
import process from 'node:process'

// Fix Windows drive letter casing (e.g. d:\ vs D:\) which causes Node ESM duplicate module instances in Vitest
if (process.platform === 'win32' && process.cwd()[1] === ':') {
  const upperDrive = process.cwd()[0].toUpperCase() + process.cwd().slice(1)
  process.chdir(upperDrive)
}

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const res = spawnSync(npxCmd, ['vitest', 'run', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
})

process.exit(res.status ?? 0)
