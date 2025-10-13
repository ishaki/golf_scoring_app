/**
 * Unit tests for scoring logic
 * Run with: npm test (after setting up testing framework)
 */

import { calculateHolePoints, calculateGameTotals } from '../scoring';
import { calculateAllStrokeHoles } from '../voor';

// Default scoring configuration for tests
const DEFAULT_SCORING_CONFIG = {
  eagleOrBetter: {
    againstLower: 4,
  },
  birdie: {
    againstLower: 2,
  },
  par: {
    againstLower: 1,
  },
  bogey: {
    againstLower: 1,
  },
};

/**
 * Test Case 1: Simple hole with no voor
 */
export function testSimpleHoleNoVoor() {
  const players = [
    { id: '1', name: 'Alice', voorGiven: {} },
    { id: '2', name: 'Bob', voorGiven: {} },
    { id: '3', name: 'Carol', voorGiven: {} },
    { id: '4', name: 'David', voorGiven: {} },
    { id: '5', name: 'Emma', voorGiven: {} },
    { id: '6', name: 'Frank', voorGiven: {} },
  ];

  const hole = {
    number: 5,
    par: 4,
    strokeIndex: 10,
    scores: {
      '1': 3, // Alice - birdie
      '2': 4, // Bob - par
      '3': 4, // Carol - par
      '4': 5, // David - bogey
      '5': 6, // Emma - double
      '6': 4, // Frank - par
    },
    netScores: {},
    points: {},
  };

  const strokeIndexes = Array.from({ length: 18 }, (_, i) => i + 1);
  const strokeHolesMap = calculateAllStrokeHoles(players, strokeIndexes);

  const points = calculateHolePoints(hole, players, strokeHolesMap, strokeIndexes, DEFAULT_SCORING_CONFIG, 'fighter');

  console.log('Test Case 1: Simple hole with no voor');
  console.log('Expected: Alice +10, Bob 0, Carol 0, David -6, Emma -8, Frank 0');
  console.log('Actual:', points);
  console.log('---');

  // Expected results:
  // Alice (birdie): +2 from each of 5 players = +10
  // Bob (par): -2 from Alice, 0 from Carol/Frank, +1 from David, +1 from Emma = 0
  // Carol (par): -2 from Alice, 0 from Bob/Frank, +1 from David, +1 from Emma = 0
  // David (bogey): -2 from Alice, -1 from Bob/Carol/Frank, +1 from Emma = -6
  // Emma (double): -2 from Alice, -1 from Bob/Carol/Frank, -1 from David = -8
  // Frank (par): -2 from Alice, 0 from Bob/Carol, +1 from David, +1 from Emma = 0
}

/**
 * Test Case 2: Hole with voor strokes
 */
export function testHoleWithVoor() {
  const players = [
    { id: '1', name: 'Alice', voorGiven: { '2': 2 } }, // Alice gives 2 to Bob
    { id: '2', name: 'Bob', voorGiven: {} },
    { id: '3', name: 'Carol', voorGiven: {} },
    { id: '4', name: 'David', voorGiven: {} },
    { id: '5', name: 'Emma', voorGiven: {} },
    { id: '6', name: 'Frank', voorGiven: {} },
  ];

  const hole = {
    number: 1, // Stroke index 1 - Bob gets stroke here
    par: 4,
    strokeIndex: 1,
    scores: {
      '1': 4, // Alice - par (gross)
      '2': 4, // Bob - par (gross), birdie (net 3)
      '3': 4, // Carol - par
      '4': 4, // David - par
      '5': 4, // Emma - par
      '6': 4, // Frank - par
    },
    netScores: {},
    points: {},
  };

  const strokeIndexes = Array.from({ length: 18 }, (_, i) => i + 1);
  const strokeHolesMap = calculateAllStrokeHoles(players, strokeIndexes);

  const points = calculateHolePoints(hole, players, strokeHolesMap, strokeIndexes, DEFAULT_SCORING_CONFIG, 'fighter');

  console.log('Test Case 2: Hole with voor');
  console.log('Bob gets stroke on this hole (index 1)');
  console.log('Expected: Bob +10 (net birdie), others -2 each');
  console.log('Actual:', points);
  console.log('---');

  // Expected: Bob's net score is 3 (birdie), beats all others
  // Bob: +2 from each of 5 players = +10
  // Others: -2 from Bob each = -2
}

/**
 * Test Case 3: Tie on stroke hole (voor wins)
 */
export function testTieOnStrokeHole() {
  const players = [
    { id: '1', name: 'Alice', voorGiven: { '2': 1 } },
    { id: '2', name: 'Bob', voorGiven: {} },
    { id: '3', name: 'Carol', voorGiven: {} },
    { id: '4', name: 'David', voorGiven: {} },
    { id: '5', name: 'Emma', voorGiven: {} },
    { id: '6', name: 'Frank', voorGiven: {} },
  ];

  const hole = {
    number: 1, // Stroke index 1 - Bob gets stroke
    par: 4,
    strokeIndex: 1,
    scores: {
      '1': 4, // Alice - par (net 4)
      '2': 4, // Bob - par (gross), net 3
      '3': 5, // Carol - bogey
      '4': 5, // David - bogey
      '5': 5, // Emma - bogey
      '6': 5, // Frank - bogey
    },
    netScores: {},
    points: {},
  };

  const strokeIndexes = Array.from({ length: 18 }, (_, i) => i + 1);
  const strokeHolesMap = calculateAllStrokeHoles(players, strokeIndexes);

  const points = calculateHolePoints(hole, players, strokeHolesMap, strokeIndexes, DEFAULT_SCORING_CONFIG, 'fighter');

  console.log('Test Case 3: Tie on stroke hole');
  console.log('Alice and Bob both score 4 (gross), but Bob gets stroke');
  console.log('Expected: Bob wins (net 3 vs net 4)');
  console.log('Actual:', points);
  console.log('---');

  // Bob's net birdie (3) beats Alice's par (4)
  // Bob should win against everyone
}

/**
 * Test Case 4: All players score the same (no voor)
 */
export function testAllPlayersScoreSame() {
  const players = [
    { id: '1', name: 'Alice', voorGiven: {} },
    { id: '2', name: 'Bob', voorGiven: {} },
    { id: '3', name: 'Carol', voorGiven: {} },
    { id: '4', name: 'David', voorGiven: {} },
    { id: '5', name: 'Emma', voorGiven: {} },
    { id: '6', name: 'Frank', voorGiven: {} },
  ];

  const hole = {
    number: 5,
    par: 4,
    strokeIndex: 10,
    scores: {
      '1': 4,
      '2': 4,
      '3': 4,
      '4': 4,
      '5': 4,
      '6': 4,
    },
    netScores: {},
    points: {},
  };

  const strokeIndexes = Array.from({ length: 18 }, (_, i) => i + 1);
  const strokeHolesMap = calculateAllStrokeHoles(players, strokeIndexes);

  const points = calculateHolePoints(hole, players, strokeHolesMap, strokeIndexes, DEFAULT_SCORING_CONFIG, 'fighter');

  console.log('Test Case 4: All players score the same');
  console.log('Expected: All 0 points');
  console.log('Actual:', points);
  console.log('---');

  // All tie = 0 points for everyone
}

/**
 * Test Case 5: Voor hole tie with double bogey (NEW RULE)
 */
export function testVoorHoleTieWithDoubleBogey() {
  const players = [
    { id: '1', name: 'Alice', voorGiven: { '2': 1 } }, // Alice gives 1 stroke to Bob
    { id: '2', name: 'Bob', voorGiven: {} },
    { id: '3', name: 'Carol', voorGiven: {} },
    { id: '4', name: 'David', voorGiven: {} },
    { id: '5', name: 'Emma', voorGiven: {} },
    { id: '6', name: 'Frank', voorGiven: {} },
  ];

  const hole = {
    number: 1, // Stroke index 1 - Bob gets stroke
    par: 4,
    strokeIndex: 1,
    scores: {
      '1': 6, // Alice - double bogey (gross)
      '2': 5, // Bob - bogey (gross), but gets stroke so net = 4
      '3': 5, // Carol - bogey
      '4': 5, // David - bogey
      '5': 5, // Emma - bogey
      '6': 5, // Frank - bogey
    },
    netScores: {},
    points: {},
  };

  const strokeIndexes = Array.from({ length: 18 }, (_, i) => i + 1);
  const strokeHolesMap = calculateAllStrokeHoles(players, strokeIndexes);

  const points = calculateHolePoints(hole, players, strokeHolesMap, strokeIndexes, DEFAULT_SCORING_CONFIG, 'fighter');

  console.log('Test Case 5: Voor hole tie with double bogey');
  console.log('Alice scores 6 (double bogey), Bob scores 5 (bogey) but gets stroke');
  console.log('Net scores: Alice=6, Bob=4 (Bob wins with net score)');
  console.log('Expected: Bob gets points, Alice gets 0 points (double bogey rule)');
  console.log('Actual:', points);
  console.log('---');

  // Bob's net 4 beats Alice's net 6, so Bob should win
  // But Alice should get 0 points due to double bogey rule
}

/**
 * Test Case 6: Voor hole tie with double bogey (EXACT SCENARIO)
 */
export function testVoorHoleTieExactScenario() {
  const players = [
    { id: '1', name: 'Alice', voorGiven: { '2': 1 } }, // Alice gives 1 stroke to Bob
    { id: '2', name: 'Bob', voorGiven: {} },
    { id: '3', name: 'Carol', voorGiven: {} },
    { id: '4', name: 'David', voorGiven: {} },
    { id: '5', name: 'Emma', voorGiven: {} },
    { id: '6', name: 'Frank', voorGiven: {} },
  ];

  const hole = {
    number: 1, // Stroke index 1 - Bob gets stroke
    par: 4,
    strokeIndex: 1,
    scores: {
      '1': 6, // Alice - double bogey (gross), net = 6
      '2': 5, // Bob - bogey (gross), gets stroke so net = 4
      '3': 6, // Carol - double bogey, net = 6
      '4': 6, // David - double bogey, net = 6
      '5': 6, // Emma - double bogey, net = 6
      '6': 6, // Frank - double bogey, net = 6
    },
    netScores: {},
    points: {},
  };

  const strokeIndexes = Array.from({ length: 18 }, (_, i) => i + 1);
  const strokeHolesMap = calculateAllStrokeHoles(players, strokeIndexes);

  const points = calculateHolePoints(hole, players, strokeHolesMap, strokeIndexes, DEFAULT_SCORING_CONFIG, 'fighter');

  console.log('Test Case 6: Voor hole tie with double bogey (EXACT SCENARIO)');
  console.log('Alice scores 6 (double bogey), Bob scores 5 (bogey) but gets stroke');
  console.log('Net scores: Alice=6, Bob=4, Others=6');
  console.log('Expected: Bob wins against everyone, Alice gets 0 points (double bogey rule)');
  console.log('Actual:', points);
  console.log('---');

  // Bob's net 4 beats everyone else's net 6
  // Alice should get 0 points due to double bogey rule on voor hole tie
}

/**
 * Test Case 7: Mixed scores (birdies, pars, bogeys)
 */
export function testMixedScores() {
  const players = [
    { id: '1', name: 'Alice', voorGiven: {} },
    { id: '2', name: 'Bob', voorGiven: {} },
    { id: '3', name: 'Carol', voorGiven: {} },
    { id: '4', name: 'David', voorGiven: {} },
    { id: '5', name: 'Emma', voorGiven: {} },
    { id: '6', name: 'Frank', voorGiven: {} },
  ];

  const hole = {
    number: 7,
    par: 4,
    strokeIndex: 5,
    scores: {
      '1': 3, // Alice - birdie
      '2': 3, // Bob - birdie
      '3': 4, // Carol - par
      '4': 5, // David - bogey
      '5': 5, // Emma - bogey
      '6': 6, // Frank - double
    },
    netScores: {},
    points: {},
  };

  const strokeIndexes = Array.from({ length: 18 }, (_, i) => i + 1);
  const strokeHolesMap = calculateAllStrokeHoles(players, strokeIndexes);

  const points = calculateHolePoints(hole, players, strokeHolesMap, strokeIndexes, DEFAULT_SCORING_CONFIG, 'fighter');

  console.log('Test Case 5: Mixed scores');
  console.log('Alice & Bob: birdie, Carol: par, David & Emma: bogey, Frank: double');
  console.log('Actual:', points);
  console.log('---');

  // Alice: 0 from Bob, +2 from Carol/David/Emma/Frank = +8
  // Bob: 0 from Alice, +2 from Carol/David/Emma/Frank = +8
  // Carol: -2 from Alice/Bob, +1 from David/Emma/Frank = -1
  // David: -2 from Alice/Bob, -1 from Carol, 0 from Emma, +1 from Frank = -4
  // Emma: -2 from Alice/Bob, -1 from Carol, 0 from David, +1 from Frank = -4
  // Frank: -2 from Alice/Bob, -1 from Carol/David/Emma = -7
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log('=== Running Scoring Logic Tests ===\n');

  testSimpleHoleNoVoor();
  testHoleWithVoor();
  testTieOnStrokeHole();
  testAllPlayersScoreSame();
  testMixedScores();

  console.log('\n=== Tests Complete ===');
  console.log('Note: These are manual tests. Compare actual vs expected results.');
  console.log('For automated testing, set up Jest or Vitest.');
}

// Uncomment to run tests
// runAllTests();
