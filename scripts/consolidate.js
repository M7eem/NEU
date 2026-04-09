#!/usr/bin/env node
/**
 * Consolidation script for extracted questions.
 * Usage: node scripts/consolidate.js path/to/agent1.json path/to/agent2.json ...
 *
 * Reads JSON arrays from each file, merges them, infers lectureId from source
 * if not already set, deduplicates by normalized question text, then writes
 * to src/data/questions.json.
 */

const fs = require('fs');
const path = require('path');

// Map source filename patterns to lectureId
function inferLectureId(source) {
  if (!source) return 'Final';
  const s = source.toLowerCase();
  // Match TBL number
  const tblMatch = s.match(/tbl[- _]?(\d)/);
  if (tblMatch) return `TBL${tblMatch[1]}`;
  if (s.includes('midterm')) return 'Midterm';
  if (s.includes('ospe')) return 'OSPE';
  if (s.includes('saq')) return 'SAQ_Final';
  if (s.includes('final')) return 'Final';
  return 'Final';
}

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();
}

const inputFiles = process.argv.slice(2);
if (inputFiles.length === 0) {
  console.error('Usage: node consolidate.js file1.json file2.json ...');
  process.exit(1);
}

let allQuestions = [];
const seen = new Set();
let dupeCount = 0;

for (const filePath of inputFiles) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    console.warn(`Skipping missing file: ${abs}`);
    continue;
  }
  let data;
  try {
    data = JSON.parse(fs.readFileSync(abs, 'utf8'));
  } catch (e) {
    console.warn(`Could not parse ${abs}: ${e.message}`);
    continue;
  }
  const arr = Array.isArray(data) ? data : [];
  console.log(`${abs}: ${arr.length} questions`);

  for (const q of arr) {
    // Infer lectureId if not set
    if (!q.lectureId || q.lectureId === '' || q.lectureId === 'unknown') {
      q.lectureId = inferLectureId(q.source || '');
    }

    // Dedup by normalized question text
    const key = normalizeText(q.question);
    if (key && seen.has(key)) {
      dupeCount++;
      continue;
    }
    if (key) seen.add(key);

    // Remove the 'source' field from final output (keep clean)
    const { source, ...rest } = q;
    allQuestions.push(rest);
  }
}

// Sort: by lectureId, then type (MCQ → SAQ → OSPE), then id
const typeOrder = { MCQ: 0, SAQ: 1, OSPE: 2 };
const lectureOrder = ['TBL1','TBL2','TBL3','TBL4','TBL5','TBL6','TBL7','Midterm','Final','OSPE','SAQ_Final'];

allQuestions.sort((a, b) => {
  const la = lectureOrder.indexOf(a.lectureId);
  const lb = lectureOrder.indexOf(b.lectureId);
  if (la !== lb) return (la === -1 ? 99 : la) - (lb === -1 ? 99 : lb);
  const ta = typeOrder[a.type] ?? 99;
  const tb = typeOrder[b.type] ?? 99;
  if (ta !== tb) return ta - tb;
  return (a.id || '').localeCompare(b.id || '');
});

// Re-assign clean sequential IDs
allQuestions = allQuestions.map((q, i) => ({
  ...q,
  id: q.id || `q${String(i + 1).padStart(4, '0')}`,
}));

const outPath = path.join(__dirname, '..', 'src', 'data', 'questions.json');
fs.writeFileSync(outPath, JSON.stringify(allQuestions, null, 2));
console.log(`\nWrote ${allQuestions.length} questions to ${outPath}`);
console.log(`Duplicates removed: ${dupeCount}`);
