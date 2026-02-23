export type LevelId = 1 | 2 | 3 | 4;

export type lvllTypes = {
  id: LevelId;
  name: string;
  rows: number[];
  spikesRange: [number, number];
  stars: number;
  subtitle: string;
};

export const LEVEL_META: Record<LevelId, lvllTypes> = {
  1: {
    id: 1,
    name: 'Starter Field',
    rows: [3, 3, 3, 3],
    spikesRange: [4, 5],
    stars: 1,
    subtitle:
      'Learn the basics and find a safe route through a wider 4-row field.',
  },
  2: {
    id: 2,
    name: 'Midfield Route',
    rows: [4, 4, 4, 4, 4],
    spikesRange: [8, 10],
    stars: 2,
    subtitle:
      'The board grows to five rows, with denser traps and fewer safe decisions.',
  },
  3: {
    id: 3,
    name: 'Danger Grid',
    rows: [5, 5, 5, 5, 5],
    spikesRange: [13, 16],
    stars: 3,
    subtitle:
      'A full 5×5-style field with heavy spike pressure. Memory and precision are critical.',
  },
  4: {
    id: 4,
    name: 'Pyramid Challenge',
    rows: [3, 4, 5, 6, 6, 5],
    spikesRange: [17, 22],
    stars: 4,
    subtitle:
      'A six-row late-game gauntlet with near-max spike density. One wrong pick ends the run.',
  },
};
