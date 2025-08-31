import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['apps/web', 'packages/schemas', 'packages/ui', 'packages/utils'];

let failed = false;
for (const dir of roots) {
  const tsconfig = join(process.cwd(), dir, 'tsconfig.json');
  if (!existsSync(tsconfig)) {
    console.log(`[skip] ${dir} (no tsconfig.json)`);
    continue;
  }
  try {
    console.log(`\n[typecheck] ${dir}`);
    execSync('pnpm exec tsc -p tsconfig.json --noEmit', {
      stdio: 'inherit',
      cwd: join(process.cwd(), dir),
    });
  } catch (e) {
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
