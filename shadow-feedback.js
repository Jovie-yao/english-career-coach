const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export const FUNCTION_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "to", "of", "for", "in", "on", "at", "with",
  "as", "is", "are", "was", "were", "be", "been", "being", "i", "you", "he", "she",
  "it", "we", "they", "my", "your", "our", "their", "this", "that", "these", "those",
]);

export function normalizeSpeech(text = "") {
  return text.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9'\s-]/g, " ").replace(/\s+/g, " ").trim();
}

const tokens = (text) => normalizeSpeech(text).split(" ").filter(Boolean);
const wordWeight = (word) => FUNCTION_WORDS.has(word) ? 0.35 : 1;

function charDistance(a, b) {
  const rows = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) rows[i][0] = i;
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return rows[a.length][b.length];
}

const wordSimilarity = (a, b) => a === b ? 1 : 1 - charDistance(a, b) / Math.max(a.length, b.length, 1);
const contractionBase = (word) => word.replace(/'(ll|d|m|re|ve|s|t)$/i, "");
const isMinorRecognitionDifference = (a, b, similarity) =>
  contractionBase(a) === contractionBase(b) && a !== b ||
  (Math.min(a.length, b.length) <= 3 && similarity >= 0.65);

function substitution(modelWord, spokenWord) {
  if (modelWord === spokenWord) return { cost: 0, op: "matched", similarity: 1 };
  const similarity = wordSimilarity(modelWord, spokenWord);
  if (isMinorRecognitionDifference(modelWord, spokenWord, similarity)) return { cost: 0.08, op: "minor", similarity };
  const weight = wordWeight(modelWord);
  const cost = similarity >= 0.84 ? 0.18 * weight : Math.max(0.55, 1 - similarity) * weight;
  return { cost, op: "different", similarity };
}

export function compareWords(modelSentence, transcript) {
  const model = tokens(modelSentence), spoken = tokens(transcript);
  const rows = Array.from({ length: model.length + 1 }, () => Array(spoken.length + 1));
  rows[0][0] = { cost: 0, op: null };
  for (let i = 1; i <= model.length; i++) rows[i][0] = { cost: rows[i - 1][0].cost + wordWeight(model[i - 1]), op: "missing" };
  for (let j = 1; j <= spoken.length; j++) rows[0][j] = { cost: rows[0][j - 1].cost + wordWeight(spoken[j - 1]), op: "extra" };
  for (let i = 1; i <= model.length; i++) for (let j = 1; j <= spoken.length; j++) {
    const sub = substitution(model[i - 1], spoken[j - 1]);
    const choices = [
      { cost: rows[i - 1][j].cost + wordWeight(model[i - 1]), op: "missing" },
      { cost: rows[i][j - 1].cost + wordWeight(spoken[j - 1]), op: "extra" },
      { cost: rows[i - 1][j - 1].cost + sub.cost, op: sub.op, similarity: sub.similarity },
    ];
    rows[i][j] = choices.sort((a, b) => a.cost - b.cost)[0];
  }
  const operations = []; let i = model.length, j = spoken.length;
  while (i || j) {
    const cell = rows[i][j];
    if (["matched", "different", "minor"].includes(cell.op)) {
      operations.unshift({ type: cell.op, model: model[i - 1], spoken: spoken[j - 1], similarity: cell.similarity ?? 1, content: !FUNCTION_WORDS.has(model[i - 1]) }); i--; j--;
    } else if (cell.op === "missing") {
      operations.unshift({ type: "missing", model: model[i - 1], content: !FUNCTION_WORDS.has(model[i - 1]) }); i--;
    } else {
      operations.unshift({ type: "extra", spoken: spoken[j - 1], content: !FUNCTION_WORDS.has(spoken[j - 1]) }); j--;
    }
  }
  const missingOps = operations.filter((item) => item.type === "missing");
  const missing = missingOps.map((item) => item.model);
  const different = operations.filter((item) => item.type === "different");
  const minor = operations.filter((item) => item.type === "minor");
  const extra = operations.filter((item) => item.type === "extra").map((item) => item.spoken);
  const totalWeight = model.reduce((sum, word) => sum + wordWeight(word), 0);
  const missingWeight = missingOps.reduce((sum, item) => sum + wordWeight(item.model), 0);
  const denominator = Math.max(totalWeight, spoken.reduce((sum, word) => sum + wordWeight(word), 0), 1);
  return {
    model, spoken, operations, missing, missingOps, extra, different, minor,
    matched: operations.filter((item) => item.type === "matched").length,
    accuracy: Math.round(clamp((1 - rows[model.length][spoken.length].cost / denominator) * 100)),
    completeness: Math.round(clamp((totalWeight - missingWeight) / Math.max(totalWeight, 1) * 100)),
    captured: model.length - missing.length, total: model.length,
  };
}

export function detectActiveSpeech(samples, fullDuration) {
  const valid = samples.filter((sample) => Number.isFinite(sample.time) && Number.isFinite(sample.level)).sort((a, b) => a.time - b.time);
  if (valid.length < 8 || !fullDuration) return { activeDurationAvailable: false, fullDuration };
  const sortedLevels = valid.map((sample) => sample.level).sort((a, b) => a - b);
  const noiseFloor = sortedLevels[Math.floor(sortedLevels.length * 0.2)] ?? 0;
  const threshold = Math.max(0.018, noiseFloor + Math.max(0.014, noiseFloor * 1.8));
  const active = valid.filter((sample) => sample.level >= threshold);
  if (active.length < 5) return { activeDurationAvailable: false, fullDuration, noiseFloor, threshold };
  const clusters = []; let cluster = [active[0]];
  for (let i = 1; i < active.length; i++) {
    if (active[i].time - active[i - 1].time <= 0.18) cluster.push(active[i]);
    else { if (cluster.length >= 3) clusters.push(cluster); cluster = [active[i]]; }
  }
  if (cluster.length >= 3) clusters.push(cluster);
  if (!clusters.length) return { activeDurationAvailable: false, fullDuration, noiseFloor, threshold };
  const speechStart = clusters[0][0].time;
  const speechEnd = clusters.at(-1).at(-1).time;
  const activeDuration = Math.max(0, speechEnd - speechStart);
  if (activeDuration < 0.5) return { activeDurationAvailable: false, fullDuration, noiseFloor, threshold };
  const activeFrameSpan = active.reduce((sum, sample, index) => index ? sum + Math.min(0.08, sample.time - active[index - 1].time) : 0, 0);
  return {
    activeDurationAvailable: true, fullDuration, activeDuration,
    speechStart, speechEnd, leadingSilence: speechStart,
    trailingSilence: Math.max(0, fullDuration - speechEnd),
    activityRatio: clamp(activeFrameSpan / activeDuration, 0, 1),
    noiseFloor, threshold,
  };
}

export function paceEstimate(wordCount, duration) {
  if (!duration || !wordCount) return null;
  const wpm = Math.round(wordCount / duration * 60); let score = 100;
  let guidance = "Your active speaking pace was natural for this practice.";
  if (wpm < 110) { score = Math.round(clamp(100 - (110 - wpm) * 1.2, 20)); guidance = "Try connecting the phrase more smoothly."; }
  else if (wpm > 160) { score = Math.round(clamp(100 - (wpm - 160), 20)); guidance = "Slow down slightly and keep the stressed words clear."; }
  return { score, wpm, guidance, reference: "110–160 WPM is a practice reference for this sentence, not an absolute English ability standard." };
}

export function fluencyEstimate(wordCount, duration, timing = {}) {
  if (!duration || !wordCount) return null;
  const expectedDuration = wordCount / 135 * 60;
  const durationScore = clamp(92 - Math.abs(1 - duration / expectedDuration) * 38, 35);
  const continuityScore = timing.activeDurationAvailable && Number.isFinite(timing.activityRatio)
    ? clamp(55 + timing.activityRatio * 60, 45, 96) : null;
  const score = Math.round(continuityScore === null ? Math.min(85, durationScore) : durationScore * .55 + continuityScore * .45);
  return { score, explanation: timing.activeDurationAvailable ? "Basic estimate from active speaking time, recognized words, and speech continuity." : "Conservative estimate from recognized words and recording duration because active speech timing was unavailable." };
}

function chunkFor(modelWords, target) {
  const index = modelWords.indexOf(target);
  if (index < 0) return target;
  return modelWords.slice(Math.max(0, index - 1), Math.min(modelWords.length, index + 2)).join(" ");
}

export function evaluateShadowing(modelSentence, transcript, fullDuration, timing = {}) {
  const normalizedTranscript = normalizeSpeech(transcript);
  if (!normalizedTranscript) return { reliable: false, reason: "no-transcript", message: "We couldn't get a reliable transcript this time. Please try again." };
  const comparison = compareWords(modelSentence, normalizedTranscript);
  const scoringDuration = timing.activeDurationAvailable ? timing.activeDuration : fullDuration;
  const pace = paceEstimate(comparison.spoken.length, scoringDuration);
  const fluency = fluencyEstimate(comparison.spoken.length, scoringDuration, timing);
  const metrics = { accuracy: comparison.accuracy, completeness: comparison.completeness, fluency: fluency?.score ?? null, pace: pace?.score ?? null };
  const weights = { accuracy: .40, completeness: .25, fluency: .20, pace: .15 };
  const available = Object.entries(metrics).filter(([, value]) => value !== null);
  const weightTotal = available.reduce((sum, [key]) => sum + weights[key], 0);
  const overall = available.length >= 2 ? Math.round(available.reduce((sum, [key, value]) => sum + value * weights[key], 0) / weightTotal) : null;

  const contentMismatch = comparison.different.filter((item) => item.content).sort((a, b) => a.similarity - b.similarity);
  const contentMissing = comparison.missingOps.filter((item) => item.content);
  const functionMissing = comparison.missingOps.filter((item) => !item.content);
  const nextAttempt = [];
  const flowText = comparison.model.includes("different") && comparison.model.includes("adapt")
    ? "different teams    and adapt quickly" : comparison.model.join(" ");
  const target = contentMismatch[0]?.model ?? contentMissing[0]?.model;
  if (target) {
    nextAttempt.push({ type: "word", title: "Word to fix", text: target, guidance: contentMismatch.length ? `The system heard “${contentMismatch[0].spoken}” instead of “${target}”. Try the target word again.` : "This important word was not captured. Listen once, then repeat it." });
    nextAttempt.push({ type: "chunk", title: "Chunk to practice", text: chunkFor(comparison.model, target), guidance: "Listen once, then repeat the whole chunk." });
  }
  if ((fluency && fluency.score < 78) || (pace && pace.score < 90)) nextAttempt.push({ type: "flow", title: "Flow", text: flowText, guidance: "Try saying this as one connected thought." });
  if (!nextAttempt.length && functionMissing.length) nextAttempt.push({ type: "flow", title: "Flow", text: flowText, guidance: "Keep small function words light, but connect the whole thought." });
  if (!nextAttempt.length) nextAttempt.push({ type: "flow", title: "Keep the rhythm", text: "coordinate with different teams", guidance: "Repeat once more with the same clear, connected pace." });

  const positives = [];
  if (comparison.completeness >= 90) positives.push("You completed almost the full sentence.");
  if (comparison.accuracy >= 85) positives.push("Most target words were recognized clearly.");
  if (pace && pace.score >= 95 && positives.length < 2) positives.push("Your active speaking pace was within the practice range.");
  const minorNote = comparison.minor.length ? "Small recognition difference detected; this is not treated as a pronunciation diagnosis." : "";
  const functionNote = functionMissing.length ? `Lightly missed function word${functionMissing.length > 1 ? "s" : ""}: ${functionMissing.map((item) => item.model).join(", ")}.` : "";
  return {
    reliable: true, overall, metrics, comparison, pace, fluency,
    nextAttempt: nextAttempt.slice(0, 3), positives: positives.slice(0, 2),
    transcript: normalizedTranscript, scoringDuration,
    activeDurationAvailable: Boolean(timing.activeDurationAvailable),
    timing, minorNote, functionNote,
  };
}
