import * as migration_20260601_135520_initial from './20260601_135520_initial';

export const migrations = [
  {
    up: migration_20260601_135520_initial.up,
    down: migration_20260601_135520_initial.down,
    name: '20260601_135520_initial'
  },
];
