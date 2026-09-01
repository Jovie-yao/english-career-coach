const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export function normalizeSpeech(text = "") {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const tokens = (text) => normalizeSpeech(text).split(" ").filter(Boolean);

function charDistance(a, b) {
  const rows = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) rows[i][0] = i;
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return rows[a.length][b.length];
}

function wordSimilarity(a, b) {
  if (a === b) return 1;
  return 1 - charDistance(a, b) / Math.max(a.length, b.length, 1);
}

export function compareWords(modelSentence, transcript) {
  const model = tokens(modelSentence);
  const spoken = tokens(transcript);
  const rows = Array.from({ length: model.length + 1 }, () => Array(spoken.length + 1));
  rows[0][0] = { cost: 0, op: null };
  for (let i = 1; i <= model.length; i++) rows[i][0] = { cost: i, op: "missing" };
  for (let j = 1; j <= spoken.length; j++) rows[0][j] = { cost: j, op: "extra" };
  for (let i = 1; i <= model.length; i++) {
    for (let j = 1; j <= spoken.length; j++) {
      const similarity = wordSimilarity(model[i - 1], spoken[j - 1]);
      const substitutionCost = similarity === 1 ? 0 : Math.max(0.2, 1 - similarity);
      const choices = [
        { cost: rows[i - 1][j].cost + 1, op: "missing" },
        { cost: rows[i][j - 1].cost + 1, op: "extra" },
        { cost: rows[i - 1][j - 1].cost + substitutionCost, op: similarity === 1 ? "matched" : "different", similarity },
      ];
      rows[i][j] = choices.sort((a, b) => a.cost - b.cost)[0];
    }
  }
  const operations = [];
  let i = model.length, j = spoken.length;
  while (i || j) {
    const cell = rows[i][j];
    if (cell.op === "matched" || cell.op === "different") {
      operations.unshift({ type: cell.op, model: model[i - 1], spoken: spoken[j - 1], similarity: cell.similarity ?? 1 }); i--; j--;
    } else if (cell.op === "missing") {
      operations.unshift({ type: "missing", model: model[i - 1] }); i--;
    } else {
      operations.unshift({ type: "extra", spoken: spoken[j - 1] }); j--;
    }
  }
  const missing = operations.filter((item) => item.type === "missing").map((item) => item.model);
  const extra = operations.filter((item) => item.type === "extra").map((item) => item.spoken);
  const different = operations.filter((item) => item.type === "different");
  const matched = operations.filter((item) => item.type === "matched").length;
  const accuracy = Math.round(clamp((1 - rows[model.length][spoken.length].cost / Math.max(model.length, spoken.length, 1)) * 100));
  const completeness = Math.round(clamp(((model.length - missing.length) / Math.max(model.length, 1)) * 100));
  return { model, spoken, operations, missing, extra, different, matched, accuracy, completeness, captured: model.length - missing.length, total: model.length };
}

export function paceEstimate(wordCount, duration) {
  if (!duration || !wordCount) return null;
  const wpm = Math.round(wordCount / duration * 60);
  let score = 100;
  let guidance = "Your pace was natural for this practice.";
  if (wpm < 110) {
    score = Math.round(clamp(100 - (110 - wpm) * 1.2, 20));
    guidance = "Try connecting the phrase more smoothly.";
  } else if (wpm > 160) {
    score = Math.round(clamp(100 - (wpm - 160), 20));
    guidance = "Slow down slightly and keep the stressed words clear.";
  }
  return { score, wpm, guidance, reference: "110–160 WPM is a practice reference for this sentence, not an absolute English ability standard." };
}

export function fluencyEstimate(wordCount, duration) {
  if (!duration || !wordCount) return null;
  const expectedDuration = wordCount / 135 * 60;
  const ratio = duration / expectedDuration;
  const score = ratio >= 0.75 && ratio <= 1.35 ? 92 : Math.round(clamp(92 - Math.abs(1 - ratio) * 45, 25));
  return { score, explanation: "Basic estimate from recognized word count and recording duration; it is not an exam-level pause or intonation score." };
}

export function evaluateShadowing(modelSentence, transcript, duration) {
  const normalizedTranscript = normalizeSpeech(transcript);
  if (!normalizedTranscript) return { reliable: false, reason: "no-transcript", message: "We couldn't get a reliable transcript this time. Please try again." };
  const comparison = compareWords(modelSentence, normalizedTranscript);
  const pace = paceEstimate(comparison.spoken.length, duration);
  const fluency = fluencyEstimate(comparison.spoken.length, duration);
  const metrics = {
    accuracy: comparison.accuracy,
    completeness: comparison.completeness,
    fluency: fluency?.score ?? null,
    pace: pace?.score ?? null,
  };
  const weights = { accuracy: .40, completeness: .25, fluency: .20, pace: .15 };
  const available = Object.entries(metrics).filter(([, value]) => value !== null);
  const weightTotal = available.reduce((sum, [key]) => sum + weights[key], 0);
  const overall = available.length >= 2 ? Math.round(available.reduce((sum, [key, value]) => sum + value * weights[key], 0) / weightTotal) : null;
  const focus = [];
  if (comparison.missing.length) focus.push(`Make sure you include “${comparison.missing.slice(0, 3).join("”, “")}”.`);
  if (comparison.different.length) focus.push(`Check ${comparison.different.slice(0, 2).map((x) => `“${x.model}” (heard as “${x.spoken}”)`).join("; ")}.`);
  if (comparison.completeness < 80 && focus.length < 3) focus.push("Shadow the full sentence in two chunks, then connect them.");
  if (fluency && fluency.score < 75 && focus.length < 3) focus.push("Try connecting “different teams” more smoothly.");
  if (pace && pace.score < 90 && focus.length < 3) focus.push(pace.guidance);
  if (!focus.length) focus.push("Keep the stressed words clear while maintaining the same rhythm.");
  const positives = [];
  if (comparison.completeness >= 90) positives.push("You completed almost the full sentence.");
  if (comparison.accuracy >= 85) positives.push("Your transcript matched the model sentence closely.");
  if (pace && pace.score >= 95 && positives.length < 2) positives.push("Your speaking pace was natural for this practice.");
  return { reliable: true, overall, metrics, comparison, pace, fluency, focus: focus.slice(0, 3), positives: positives.slice(0, 2), transcript: normalizedTranscript };
}
