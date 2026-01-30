export type LevelId = 1 | 2 | 3 | 4;

export type LevelMeta = {
  id: LevelId;
  name: string;
  rows: number[];
  spikesRange: [number, number];
  stars: number;
  subtitle: string;
};

export const LEVEL_META: Record<LevelId, LevelMeta> = {
  1: {
    id: 1,
    name: 'Starter Field',
    rows: [2, 2, 2, 2],
    spikesRange: [3, 3],
    stars: 1,
    subtitle:
      'Learn the basics and find the safe path through two simple rows.',
  },
  2: {
    id: 2,
    name: 'Midfield Route',
    rows: [3, 3, 3, 3],
    spikesRange: [4, 5],
    stars: 2,
    subtitle:
      'More rows and more traps. Watch the reveals and pick your route carefully.',
  },
  3: {
    id: 3,
    name: 'Danger Grid',
    rows: [4, 4, 4, 4],
    spikesRange: [6, 7],
    stars: 3,
    subtitle:
      'A tight 4×4 grid full of hidden spikes. Rely on memory and precise choices.',
  },
  4: {
    id: 4,
    name: 'Pyramid Challenge',
    rows: [1, 2, 3, 4, 5],
    spikesRange: [7, 9],
    stars: 4,
    subtitle:
      'A five-row pyramid with the hardest spike placement. Only perfect decisions reach the goal.',
  },
};
