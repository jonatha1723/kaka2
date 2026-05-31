import { WORLD_SIZE } from '../constants';

// Construct procedural open world map grid
const grid: number[][] = Array.from({ length: WORLD_SIZE }, () => Array(WORLD_SIZE).fill(0));

// 1. Build Central Spawn Lobby (Massive Expanded Safe Platform!)
// Spans x from 20 to 33, y from 20 to 33 (14x14 tiles!)
for (let y = 20; y <= 33; y++) {
  for (let x = 20; x <= 33; x++) {
    grid[y][x] = 1; // Solid Grass floor
  }
}

// Draw boundary walls for the safe lobby, except paths
for (let x = 20; x <= 33; x++) {
  grid[19][x] = 2; // North wall
  grid[34][x] = 2; // South wall
}
for (let y = 19; y <= 34; y++) {
  grid[y][19] = 2; // West wall
  grid[y][34] = 2; // East wall
}

// Open gates for the challenges (2-tile wide doors)
grid[19][26] = 1; grid[19][27] = 1; // North gate to Lava Run
grid[34][26] = 1; grid[34][27] = 1; // South gate to Zigzag Beam
grid[26][19] = 1; grid[27][19] = 1; // West gate to Floating Stepping Stones
grid[26][34] = 1; grid[27][34] = 1; // East gate to Tower Climb / Sky Spiral

// Mark the exact Spawn Spot (4 center tiles marked as 5)
grid[26][26] = 5;
grid[27][26] = 5;
grid[26][27] = 5;
grid[27][27] = 5;

// Adds ornamental columns/structures in Safe Lobby corners
grid[21][21] = 2;
grid[32][21] = 2;
grid[21][32] = 2;
grid[32][32] = 2;

// 2. NORTH CHALLENGE: "LAVA CORRIDOR"
// Straight runway leading north with checkboard lava patches and hurdles
for (let y = 2; y <= 18; y++) {
  grid[y][26] = 1;
  grid[y][27] = 1;
  grid[y][25] = 2; // Left side guide rails
  grid[y][28] = 2; // Right side guide rails
}
// Lava traps inside the run
grid[14][26] = 3; grid[14][27] = 3;
grid[10][26] = 3; grid[10][27] = 3;
grid[6][26] = 3;  grid[6][27] = 1; 

// Golden trophy at the end of the Lava Tunnel on the ground
grid[2][26] = 6;
grid[2][27] = 6;

// 3. WEST CHALLENGE: "FLOATING STEPS"
// Stepping stones over the absolute void running West
const floatingSteps = [
  { x: 17, y: 26 }, { x: 15, y: 26 }, { x: 13, y: 27 }, { x: 11, y: 26 },
  { x: 9, y: 24 },  { x: 7, y: 22 },  { x: 5, y: 20 },  { x: 4, y: 17 },
  { x: 5, y: 14 },  { x: 7, y: 12 },  { x: 9, y: 13 }
];
floatingSteps.forEach(s => {
  grid[s.y][s.x] = 4; // stepping stones (height 20)
});
// Goal at the end of West chain
grid[13][11] = 6; // Goal height 20!

// 4. EAST CHALLENGE: "TOWER CLIMB" (Starting at stairs, then connecting to Sky Spiral!)
// Staged steps going east, reaching up to height 90
for (let x = 35; x <= 41; x++) {
  grid[26][x] = 1; 
  grid[27][x] = 1;
}
grid[26][38] = 2; grid[27][38] = 3; // wall & lava gap
// Ascending platforms: (tileType - 10) * 8 + 15
grid[26][40] = 13; // Height: (13-10)*8 + 15 = 39
grid[27][41] = 16; // Height: (16-10)*8 + 15 = 63
grid[26][42] = 19; // Height: (19-10)*8 + 15 = 87
grid[27][43] = 6;  // Goal pedestal (Tower peak, height 90!)

// 5. SOUTH CHALLENGE: "ZIGZAG SKY BEAM"
// A narrow zigzag beam climbing up to height 50
grid[35][26] = 10; // (10-10)*8 + 15 = 15
grid[36][25] = 11; // 23
grid[37][24] = 11; // 23
grid[38][23] = 12; // 31
grid[39][24] = 12; // 31
grid[40][25] = 13; // 39
grid[41][26] = 13; // 39
grid[42][27] = 14; // 47
grid[43][26] = 14; // 47
grid[44][27] = 6;  // Peak Goal height 50! (x=27, y=44)

// 6. 👑 ULTIMATE MULTI-STAGE "HEAVEN SKY SPIRAL" (O Desafio Celestial!)
// An epic, beautiful Roblox-style obby climbing up to the sky!
// It starts from the East platform and spirals around the edges of the universe.
// Step index goes from T=22 (height 111) to T=34 (height 207) up to T=35 (height 215) Cloud Templo!

// --- STAGE A: Rainbow Sky Stairs ---
grid[25][35] = 22; // Height: (22-10)*8 + 15 = 111
grid[24][36] = 23; // Height: 119
grid[22][37] = 24; // Height: 127
grid[20][38] = 25; // Height: 135
grid[18][39] = 26; // Height: 143
grid[16][40] = 27; // Height: 151
grid[14][40] = 28; // Height: 159

// --- STAGE B: Starry Sky hops ---
grid[11][39] = 29; // Height: 167
grid[9][37]  = 30; // Height: 175
grid[8][34]  = 31; // Height: 183
grid[8][30]  = 32; // Height: 191
grid[8][26]  = 33; // Height: 199
grid[8][22]  = 34; // Height: 207

// --- STAGE C: High Altitude Molten Walk (Jumps over Sizzling Sky Lava Blocks!) ---
// Let's use tiles: 35 (safe platform at height 215), 135 (High sky lava at height 215!)
grid[9][18]  = 35;  // Height: 215 (Normal)
grid[11][16] = 35;  // Height: 215
grid[13][15] = 35;  // Height: 215
grid[15][14] = 135; // Lava Block at height 215! Jump carefully!
grid[17][14] = 35;  // Height: 215
grid[19][14] = 135; // Lava Block at height 215! Jump carefully!
grid[21][14] = 35;  // Height: 215

// --- STAGE D: The Winding Cloud Path ---
grid[24][13] = 36; // Height: 223
grid[27][13] = 36; // Height: 223
grid[30][13] = 37; // Height: 231
grid[33][14] = 37; // Height: 231
grid[36][15] = 38; // Height: 239
grid[38][17] = 38; // Height: 239
grid[40][20] = 39; // Height: 247
grid[41][23] = 39; // Height: 247

// --- STAGE E: 👑 O Castelo das Nuvens (The Cloud Castle Peak of the World!) ---
// A massive 3x3 platform floating at the zenith of the sky!
// Height: Tile 39 = 247
for (let y = 39; y <= 41; y++) {
  for (let x = 36; x <= 38; x++) {
    grid[y][x] = 39; // Solid peak platform
  }
}
// Spot of the Ultimate Golden Trophy on the Sky Castle
grid[40][37] = 6; // Goal platform at y=40, x=37, which resolves to height 253!

export const WORLD_GRID = grid;
