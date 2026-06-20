export type Tip = {
  title: string;
  body: string;
  example: string;
};

export const TIPS: Tip[] = [
  {
    title: 'Add left to right',
    body: 'For two-digit addition, add tens first, then ones. It keeps the running total visible in your head.',
    example: '47 + 38 -> 47 + 30 = 77, then + 8 = 85',
  },
  {
    title: 'Use complements for subtraction',
    body: 'When numbers are close, think distance instead of borrowing.',
    example: '102 - 89 -> 89 to 100 is 11, then +2 = 13',
  },
  {
    title: 'Break multiplication apart',
    body: 'Split one factor into friendly pieces and recombine.',
    example: '17 x 6 -> 10 x 6 + 7 x 6 = 60 + 42 = 102',
  },
  {
    title: 'Half and double',
    body: 'If one factor is even, halve it and double the other to make the product easier.',
    example: '16 x 25 -> 8 x 50 -> 4 x 100 = 400',
  },
  {
    title: 'Percent means per 100',
    body: 'Find 10% or 1% first, then scale.',
    example: '15% of 80 -> 10% is 8, 5% is 4, total 12',
  },
];
