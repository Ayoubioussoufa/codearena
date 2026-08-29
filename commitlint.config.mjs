export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['api', 'web', 'dojo', 'shared', 'docs', 'adr', 'repo', 'infra', 'deps'],
    ],
  },
};
