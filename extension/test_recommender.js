const fs = require('fs');
eval(fs.readFileSync('extension/taxonomy.js', 'utf8').replace(/const /g, 'var '));
eval(fs.readFileSync('extension/data.js', 'utf8').replace(/const /g, 'var '));
eval(fs.readFileSync('extension/recommender.js', 'utf8').replace(/const /g, 'var '));

// Test 1: Software Engineering
let hist1 = [
    { interaction: { watchedPercentage: 90 }, reel: { tags: ['java', 'backend'] } },
    { interaction: { watchedPercentage: 80 }, reel: { tags: ['system-design'] } }
];
let recs1 = recommend('Software Engineering / Technology Career', hist1);
console.log('TEST 1 (SWE):', recs1.map(r => r.reel.title + ' (Score: ' + r.score + ')'));

// Test 2: Gaming
let hist2 = [
    { interaction: { watchedPercentage: 90 }, reel: { tags: ['gaming', 'esports'] } }
];
let recs2 = recommend('Gaming & Esports', hist2);
console.log('TEST 2 (Gaming):', recs2.map(r => r.reel.title + ' (Score: ' + r.score + ')'));

// Test 3: Health
let hist3 = [
    { interaction: { watchedPercentage: 90 }, reel: { tags: ['workout', 'gym'] } }
];
let recs3 = recommend('Health & Fitness', hist3);
console.log('TEST 3 (Health):', recs3.map(r => r.reel.title + ' (Score: ' + r.score + ')'));