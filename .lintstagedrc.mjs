export default {
  'apps/api/**/*.ts': [
    'pnpm --filter api exec eslint --fix',
    () => 'pnpm --filter api run typecheck',
  ],
  'apps/worker/**/*.ts': [
    'pnpm --filter worker exec eslint --fix',
    () => 'pnpm --filter worker run typecheck',
  ],
  'apps/web/**/*.{ts,tsx}': [
    'pnpm --filter web exec eslint --fix',
    () => 'pnpm --filter web run typecheck',
  ],
  'apps/dojo/**/*.{ts,tsx}': [
    'pnpm --filter dojo exec eslint --fix',
    () => 'pnpm --filter dojo run typecheck',
  ],
  'packages/shared/**/*.ts': [() => 'pnpm --filter shared run typecheck'],
};
