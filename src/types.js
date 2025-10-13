/**
 * @typedef {Object} Player
 * @property {string} id - Unique player identifier
 * @property {string} name - Player name
 * @property {Object.<string, number>} voorGiven - Strokes given TO other players (playerId: strokes)
 * @property {number[]} strokeHoles - Hole numbers where player RECEIVES strokes
 */

/**
 * @typedef {Object} Hole
 * @property {number} number - Hole number (1-18)
 * @property {number} par - Par value (3-5)
 * @property {number} strokeIndex - Stroke index (1-18, lower = harder)
 * @property {Object.<string, number>} scores - Gross scores (playerId: score)
 * @property {Object.<string, number>} netScores - Net scores after voor (playerId: netScore)
 * @property {Object.<string, number>} points - Points earned this hole (playerId: points)
 */

/**
 * @typedef {Object} ScoringConfiguration
 * @property {Object} eagleOrBetter - Eagle or better scoring
 * @property {number} eagleOrBetter.againstLower - Points against lower scores
 * @property {Object} birdie - Birdie scoring
 * @property {number} birdie.againstLower - Points against lower scores
 * @property {Object} par - Par scoring
 * @property {number} par.againstLower - Points against lower scores
 * @property {Object} bogey - Bogey scoring
 * @property {number} bogey.againstLower - Points against lower scores
 */

/**
 * @typedef {'fighter'|'single_winner'} ScoringSystem
 */

/**
 * @typedef {Object} Game
 * @property {string} id - Unique game identifier
 * @property {string} createdAt - ISO timestamp
 * @property {Player[]} players - Array of 6 players
 * @property {Hole[]} holes - Array of 18 holes
 * @property {number} currentHole - Current hole number (1-18)
 * @property {boolean} isComplete - Whether game is finished
 * @property {Object.<string, number>} totals - Cumulative points (playerId: totalPoints)
 * @property {ScoringConfiguration} scoringConfig - Scoring configuration for this game
 * @property {ScoringSystem} scoringSystem - Scoring system type ('fighter' or 'single_winner')
 * @property {string} public_token - UUID for public sharing
 * @property {boolean} isPublic - Whether game is publicly shared
 */

/**
 * @typedef {Object} GameSettings
 * @property {number[]} defaultStrokeIndex - Default stroke index array [1-18]
 * @property {number[]} defaultPars - Default par values per hole
 * @property {string} theme - UI theme ('light' or 'dark')
 */

/**
 * @typedef {Object} GameHistory
 * @property {string} id - Game ID
 * @property {string} createdAt - ISO timestamp
 * @property {string[]} playerNames - Array of player names
 * @property {Object.<string, number>} totals - Final scores
 * @property {string} winner - Winner's name
 */

/**
 * @typedef {Object} CourseHole
 * @property {number} number - Hole number (1-9 or 1-18)
 * @property {number} strokeIndex - Stroke index (difficulty ranking, must be unique)
 * @property {3|4|5} par - Par value
 */

/**
 * @typedef {Object} Course
 * @property {string} id - Unique course identifier
 * @property {string} name - Course name
 * @property {'9-hole'|'18-hole'} type - Course type
 * @property {CourseHole[]} holes - Array of holes (9 or 18)
 * @property {string} createdAt - ISO timestamp
 * @property {boolean} isDefault - True for system preset courses
 */

export {};
