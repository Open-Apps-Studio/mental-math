// Mental-math "tricks" library shown in the Knowledge tab.
// Original copy, grouped by operation. Trick ids are stable for favoriting.

export type Trick = {
  id: string;
  title: string;
  /** One-line hook shown under the title. */
  summary: string;
  /** Worked walk-through, one step per line. */
  steps: string[];
  example: string;
};

export type TrickCategory = {
  id: string;
  title: string;
  /** Emoji shown in the banner + category card. */
  emoji: string;
  symbol: string;
  blurb: string;
  tricks: Trick[];
};

export const CATEGORIES: TrickCategory[] = [
  {
    id: 'addition',
    title: 'Addition',
    emoji: '➕',
    symbol: '+',
    blurb: 'Cool addition tricks',
    tricks: [
      {
        id: 'add-left-to-right',
        title: 'Add left to right',
        summary: 'Start with the big place values so the total is always in view.',
        steps: ['Add the tens (or hundreds) first.', 'Then add the ones onto that running total.'],
        example: '47 + 38 → 70 + 15 = 85',
      },
      {
        id: 'add-make-tens',
        title: 'Make a round number',
        summary: 'Borrow from one number to round the other.',
        steps: ['Round one number up to the nearest ten.', 'Subtract what you borrowed at the end.'],
        example: '58 + 27 → 60 + 27 = 87, then − 2 = 85',
      },
      {
        id: 'add-split',
        title: 'Split into place values',
        summary: 'Break both numbers into tens and ones, add the groups.',
        steps: ['Add the tens together.', 'Add the ones together.', 'Combine the two results.'],
        example: '63 + 28 → (60+20) + (3+8) = 80 + 11 = 91',
      },
      {
        id: 'add-compensate',
        title: 'Compensate',
        summary: 'Shift value from one number to the other to make it friendlier.',
        steps: ['Move a few units between the numbers.', 'Keep the total constant, then add.'],
        example: '49 + 36 → 50 + 35 = 85',
      },
      {
        id: 'add-doubles',
        title: 'Near doubles',
        summary: 'If the numbers are close, double one and adjust.',
        steps: ['Double the smaller number.', 'Add the difference between them.'],
        example: '7 + 8 → (7×2) + 1 = 15',
      },
    ],
  },
  {
    id: 'subtraction',
    title: 'Subtraction',
    emoji: '😎',
    symbol: '−',
    blurb: 'Cool subtraction tricks',
    tricks: [
      {
        id: 'sub-split-one',
        title: 'Split one number',
        summary: 'Subtract the tens, then the ones, in two easy hops.',
        steps: ['Subtract the tens of the second number.', 'Then subtract its ones.'],
        example: '83 − 27 → 83 − 20 = 63, then − 7 = 56',
      },
      {
        id: 'sub-split-both',
        title: 'Split both numbers',
        summary: 'Break each number into place values and subtract group by group.',
        steps: ['Subtract the tens from the tens.', 'Subtract the ones, adjusting if it goes negative.'],
        example: '74 − 38 → (70−30) − (8−4) = 40 − 4 = 36',
      },
      {
        id: 'sub-compatible',
        title: 'Compatible numbers',
        summary: 'Round to numbers that subtract cleanly, then fix up.',
        steps: ['Round the second number to something easy.', 'Correct by the amount you rounded.'],
        example: '91 − 48 → 91 − 50 = 41, then + 2 = 43',
      },
      {
        id: 'sub-compensate',
        title: 'Compensate',
        summary: 'Round the number you subtract, then give back the difference.',
        steps: ['Subtract a round number instead.', 'Add back what you over-subtracted.'],
        example: '64 − 19 → 64 − 20 = 44, then + 1 = 45',
      },
      {
        id: 'sub-add-uniformly',
        title: 'Add uniformly',
        summary: 'Add the same amount to both numbers — the gap is unchanged.',
        steps: ['Bump both numbers up to a round figure.', 'Subtract the easier pair.'],
        example: '83 − 47 → (83+3) − (47+3) = 86 − 50 = 36',
      },
      {
        id: 'sub-avoid-carryover',
        title: 'Avoid carryover',
        summary: 'Tweak the numbers so no borrowing is needed.',
        steps: ['Adjust both numbers to remove the borrow.', 'Subtract the clean version.'],
        example: '52 − 28 → 54 − 30 = 24',
      },
      {
        id: 'sub-from-1000',
        title: 'Subtract from 1,000',
        summary: 'Subtract each digit from 9, and the last from 10.',
        steps: ['Take each digit from 9.', 'Take the final digit from 10.'],
        example: '1000 − 472 → 5, 2, 8 = 528',
      },
      {
        id: 'sub-continue-counting',
        title: 'Continue counting',
        summary: 'Count up from the smaller number to the larger one.',
        steps: ['Hop from the small number to a round number.', 'Hop the rest of the way and add the hops.'],
        example: '63 − 48 → 48→50 is 2, 50→63 is 13, total 15',
      },
    ],
  },
  {
    id: 'multiplication',
    title: 'Multiplication',
    emoji: '✖️',
    symbol: '×',
    blurb: 'Cool multiplication tricks',
    tricks: [
      {
        id: 'mul-x2',
        title: 'Multiply by 2',
        summary: 'Just double the number.',
        steps: ['Add the number to itself.'],
        example: '34 × 2 → 34 + 34 = 68',
      },
      {
        id: 'mul-x4',
        title: 'Multiply by 4',
        summary: 'Double twice.',
        steps: ['Double the number.', 'Double the result.'],
        example: '23 × 4 → 46 → 92',
      },
      {
        id: 'mul-x5',
        title: 'Multiply by 5',
        summary: 'Multiply by 10 and halve.',
        steps: ['Multiply by 10.', 'Take half.'],
        example: '48 × 5 → 480 / 2 = 240',
      },
      {
        id: 'mul-x9',
        title: 'Multiply by 9',
        summary: 'Multiply by 10, then subtract the number once.',
        steps: ['Multiply by 10.', 'Subtract the original number.'],
        example: '7 × 9 → 70 − 7 = 63',
      },
      {
        id: 'mul-x9-fingers',
        title: 'The nine fingers',
        summary: 'Fold the n-th finger; fingers left and right are the digits.',
        steps: ['Hold up ten fingers.', 'Fold finger n; count fingers to the left, then right.'],
        example: '4 × 9 → 3 and 6 = 36',
      },
      {
        id: 'mul-x10',
        title: 'Multiply by 10',
        summary: 'Shift everything one place and add a zero.',
        steps: ['Append a 0 (or move the decimal one place).'],
        example: '36 × 10 = 360',
      },
      {
        id: 'mul-x11-small',
        title: 'Two-digit × 11',
        summary: 'Split the digits and drop their sum in the middle.',
        steps: ['Write the outer digits apart.', 'Put the sum of the digits between them.'],
        example: '36 × 11 → 3 (3+6) 6 = 396',
      },
      {
        id: 'mul-x11-carry',
        title: '× 11 with carry',
        summary: 'When the middle sum is 10+, carry into the left digit.',
        steps: ['Add the two digits.', 'Carry the ten into the leading digit.'],
        example: '57 × 11 → 5 (12) 7 → 627',
      },
      {
        id: 'mul-x12',
        title: 'Multiply by 12',
        summary: 'Times 10 plus times 2.',
        steps: ['Multiply by 10.', 'Add double the number.'],
        example: '14 × 12 → 140 + 28 = 168',
      },
      {
        id: 'mul-x15',
        title: 'Multiply by 15',
        summary: 'Times 10 plus half of that.',
        steps: ['Multiply by 10.', 'Add half of the result.'],
        example: '18 × 15 → 180 + 90 = 270',
      },
      {
        id: 'mul-x25',
        title: 'Multiply by 25',
        summary: 'Multiply by 100 and divide by 4.',
        steps: ['Multiply by 100.', 'Divide by 4.'],
        example: '36 × 25 → 3600 / 4 = 900',
      },
      {
        id: 'mul-x50',
        title: 'Multiply by 50',
        summary: 'Multiply by 100 and halve.',
        steps: ['Multiply by 100.', 'Take half.'],
        example: '24 × 50 → 2400 / 2 = 1200',
      },
      {
        id: 'mul-x99',
        title: 'Multiply by 99',
        summary: 'Times 100 minus the number.',
        steps: ['Multiply by 100.', 'Subtract the original number.'],
        example: '7 × 99 → 700 − 7 = 693',
      },
      {
        id: 'mul-distribute',
        title: 'Break a factor apart',
        summary: 'Split one number into friendly chunks and recombine.',
        steps: ['Split a factor into tens and ones.', 'Multiply each piece, then add.'],
        example: '17 × 6 → (10×6) + (7×6) = 102',
      },
      {
        id: 'mul-round-adjust',
        title: 'Round and adjust',
        summary: 'Multiply by a round number, then remove the extra.',
        steps: ['Round a factor up.', 'Subtract the extra groups.'],
        example: '19 × 6 → 20×6 = 120, then − 6 = 114',
      },
      {
        id: 'mul-halve-double',
        title: 'Halve and double',
        summary: 'Halve one factor and double the other.',
        steps: ['Halve the even factor.', 'Double the other factor.', 'Repeat until easy.'],
        example: '16 × 25 → 8 × 50 → 4 × 100 = 400',
      },
      {
        id: 'mul-difference-squares',
        title: 'Difference of squares',
        summary: 'For numbers around a center, use center² − offset².',
        steps: ['Find the midpoint.', 'Compute midpoint² minus offset².'],
        example: '18 × 22 → 20² − 2² = 400 − 4 = 396',
      },
      {
        id: 'mul-near-100',
        title: 'Numbers near 100',
        summary: 'Use how far each is below 100.',
        steps: ['Find each deficit from 100.', 'Cross-subtract for the front, multiply deficits for the back.'],
        example: '97 × 96 → 93 | 12 = 9312',
      },
      {
        id: 'mul-by-doubling',
        title: 'Russian doubling',
        summary: 'Halve one column, double the other, add where odd.',
        steps: ['Halve and double down two columns.', 'Add the doubled rows beside odd halves.'],
        example: '13 × 12 → 12 + 48 + 96 = 156',
      },
      {
        id: 'mul-square-base',
        title: 'Anchor on a square',
        summary: 'Multiply near a known square using a × b = c² − d².',
        steps: ['Pick a square between the factors.', 'Adjust with the offsets.'],
        example: '12 × 14 → 13² − 1 = 169 − 1 = 168',
      },
      {
        id: 'mul-decimal-shift',
        title: 'Ignore the decimal',
        summary: 'Multiply as whole numbers, then place the decimal.',
        steps: ['Drop the decimals and multiply.', 'Re-insert as many decimal places as you removed.'],
        example: '0.4 × 1.2 → 4×12 = 48 → 0.48',
      },
    ],
  },
  {
    id: 'division',
    title: 'Division',
    emoji: '➗',
    symbol: '÷',
    blurb: 'Cool division tricks',
    tricks: [
      {
        id: 'div-by-2',
        title: 'Divide by 2',
        summary: 'Just halve it.',
        steps: ['Halve the tens, then the ones.'],
        example: '146 / 2 → 73',
      },
      {
        id: 'div-by-4',
        title: 'Divide by 4',
        summary: 'Halve twice.',
        steps: ['Take half.', 'Take half again.'],
        example: '96 / 4 → 48 → 24',
      },
      {
        id: 'div-by-5',
        title: 'Divide by 5',
        summary: 'Double it, then divide by 10.',
        steps: ['Double the number.', 'Move the decimal one place left.'],
        example: '85 / 5 → 170 / 10 = 17',
      },
      {
        id: 'div-by-10',
        title: 'Divide by 10',
        summary: 'Move the decimal one place left.',
        steps: ['Shift every digit one place down.'],
        example: '430 / 10 = 43',
      },
      {
        id: 'div-by-25',
        title: 'Divide by 25',
        summary: 'Multiply by 4, then divide by 100.',
        steps: ['Multiply by 4.', 'Divide by 100.'],
        example: '900 / 25 → 3600 / 100 = 36',
      },
      {
        id: 'div-factor',
        title: 'Divide in stages',
        summary: 'Factor the divisor and divide one step at a time.',
        steps: ['Split the divisor into factors.', 'Divide by each factor in turn.'],
        example: '252 / 12 → /4 = 63, /3 = 21',
      },
      {
        id: 'div-rule-3',
        title: 'Divisible by 3?',
        summary: 'It divides by 3 when the digit sum does.',
        steps: ['Add the digits.', 'If that sum divides by 3, so does the number.'],
        example: '471 → 4+7+1 = 12 → yes',
      },
      {
        id: 'div-rule-9',
        title: 'Divisible by 9?',
        summary: 'Same digit-sum test, but for 9.',
        steps: ['Add the digits.', 'If the sum is a multiple of 9, so is the number.'],
        example: '522 → 5+2+2 = 9 → yes',
      },
      {
        id: 'div-rule-11',
        title: 'Divisible by 11?',
        summary: 'Alternately add and subtract the digits.',
        steps: ['Subtract and add digits left to right.', 'If the result is 0 or 11, it divides.'],
        example: '2728 → 2−7+2−8 = −11 → yes',
      },
    ],
  },
  {
    id: 'squares',
    title: 'Squares',
    emoji: '🟩',
    symbol: 'x²',
    blurb: 'Cool squaring tricks',
    tricks: [
      {
        id: 'sq-end-5',
        title: 'Squares ending in 5',
        summary: 'Take the tens digit n: answer is n(n+1) then 25.',
        steps: ['Multiply the tens digit by one more than itself.', 'Append 25.'],
        example: '65² → 6×7 = 42 → 4225',
      },
      {
        id: 'sq-near-base',
        title: 'Square near a round number',
        summary: 'Use (a+b)² = a² + 2ab + b² around a round a.',
        steps: ['Pick the nearest round number a.', 'Add 2ab and b².'],
        example: '52² → 2500 + 200 + 4 = 2704',
      },
      {
        id: 'sq-difference',
        title: 'Difference of squares',
        summary: 'n² = (n−d)(n+d) + d² for an easy pair.',
        steps: ['Shift down and up by the same d.', 'Multiply, then add d².'],
        example: '48² → 46×50 + 4 = 2300 + 4 = 2304',
      },
      {
        id: 'sq-add-odd',
        title: 'Add the next odd number',
        summary: 'Each square is the previous plus the next odd number.',
        steps: ['Start from a known square.', 'Add 2n+1 to reach the next.'],
        example: '13² = 144 + 25 = 169',
      },
      {
        id: 'sq-anchor-50',
        title: 'Anchor on 50',
        summary: 'For numbers near 50, use 25 ± offset, then offset².',
        steps: ['Take 25 plus the offset from 50 for the front.', 'Append the offset squared.'],
        example: '54² → 25+4 | 4² = 29 | 16 = 2916',
      },
    ],
  },
];

export function getCategory(id: string | undefined): TrickCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getTrick(categoryId: string | undefined, trickId: string | undefined): Trick | undefined {
  return getCategory(categoryId)?.tricks.find((t) => t.id === trickId);
}

export function allTricks(): { category: TrickCategory; trick: Trick }[] {
  return CATEGORIES.flatMap((category) => category.tricks.map((trick) => ({ category, trick })));
}
