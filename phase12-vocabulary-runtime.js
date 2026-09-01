import { phase12Vocabulary as sourceVocabulary } from "./phase12-vocabulary-data.js";
import { learningPriorities, pronunciationVoice } from "./phase12-spec.js";

const deepLearning = {
  coordinate: { example: "I coordinated schedules across three teams to keep the launch on track.", interview: "用它说明你如何统筹人员、任务或时间。", daily: "适合安排会议、交接任务和同步进度。", mistake: "coordinate with someone；coordinate something。", speaking: "Describe a time you coordinated several people or tasks." },
  initiative: { example: "I took the initiative to create a clearer onboarding guide.", interview: "用 take the initiative to… 展现主动发现并解决问题。", daily: "适合主动提出建议或接手无人负责的事项。", mistake: "常用 take/show initiative，不说 use an initiative 表示主动性。", speaking: "Give one example of when you took the initiative." },
  contribute: { example: "I contributed customer insights that improved our final proposal.", interview: "说明你的具体贡献以及它带来的结果。", daily: "适合表达在会议、项目或团队中的投入。", mistake: "contribute to + 名词；contribute ideas/time directly。", speaking: "How did you contribute to a successful project?" },
  collaborate: { example: "I collaborated with designers and engineers to solve the issue.", interview: "用它突出跨团队合作、沟通和共同成果。", daily: "适合谈共同完成任务或解决问题。", mistake: "collaborate with people on a project。", speaking: "Who do you collaborate with most often, and how?" },
  adapt: { example: "I adapted my communication style to support a new client.", interview: "描述变化、你的调整和最终结果。", daily: "适合谈新工具、新团队或优先级变化。", mistake: "adapt to = 适应；adapt something = 调整；不要与 adopt 混淆。", speaking: "Describe a situation where you had to adapt quickly." },
};

export const phase12Vocabulary = sourceVocabulary.map((entry) => ({ ...entry, ...deepLearning[entry.word] }));
const priorityLabel = { S: "核心高频 · S", A: "高频实用 · A", B: "场景词汇 · B", C: "扩展词汇 · C" };
const escapeHtml = (value = "") => String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));

export function speakWithAccent(text, accent) {
  if (!("speechSynthesis" in window)) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  const locale = accent === "US" ? "en-us" : "en-gb";
  utterance.voice = pronunciationVoice(speechSynthesis.getVoices(), locale) ?? null;
  utterance.lang = accent === "US" ? "en-US" : "en-GB";
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
  return true;
}

export function vocabularyCard(entry, mastery = "New") {
  const safe = (key) => escapeHtml(entry[key]);
  return `<article class="vocabulary-card" data-word="${safe("word")}">
    <div class="vocab-compact"><div><span class="eyebrow">WORD</span><h3>${safe("word")}</h3></div><span class="pill">${safe("partOfSpeech")}</span><span class="priority priority-${entry.priority}">${priorityLabel[entry.priority] ?? learningPriorities[entry.priority]}</span><span>US ${safe("usIpa")}</span><span>UK ${safe("ukIpa")}</span><button class="ghost pronounce" data-accent="US" type="button">🔊 US</button><button class="ghost pronounce" data-accent="UK" type="button">🔊 UK</button><button class="expand-vocab" aria-expanded="false" type="button">展开学习 <span>＋</span></button></div>
    <div class="vocab-details" hidden><div class="detail-grid"><section><h4>核心释义</h4><p>${safe("meaning")}</p><h4>高频搭配</h4>${entry.collocations.map(([en, zh]) => `<p class="collocation"><b>${escapeHtml(en)}</b><span>${escapeHtml(zh)}</span></p>`).join("")}<h4>例句</h4><p>${safe("example")}</p></section>
      <section class="deep"><h4>Deep Learning</h4><dl><dt>面试应用</dt><dd>${safe("interview")}</dd><dt>日常应用</dt><dd>${safe("daily")}</dd><dt>易错提醒</dt><dd>${safe("mistake")}</dd><dt>Word Family</dt><dd>${entry.wordFamily.map(escapeHtml).join(" · ")}</dd><dt>Memory Hint</dt><dd>${escapeHtml(entry.memoryHint || "把单词放进自己的真实经历中记忆。")}</dd><dt>Related / Confusing Words</dt><dd>${safe("related")}</dd><dt>Speaking Practice</dt><dd>${safe("speaking")}</dd><dt>掌握状态</dt><dd>${escapeHtml(mastery)}</dd></dl></section></div></div></article>`;
}

export function bindVocabulary(root = document) {
  root.querySelectorAll(".pronounce").forEach((button) => button.addEventListener("click", () => speakWithAccent(button.closest(".vocabulary-card").dataset.word, button.dataset.accent)));
  root.querySelectorAll(".expand-vocab").forEach((button) => button.addEventListener("click", () => {
    const details = button.closest(".vocabulary-card").querySelector(".vocab-details");
    const opening = details.hidden;
    details.hidden = !opening;
    button.setAttribute("aria-expanded", String(opening));
    button.innerHTML = `${opening ? "收起" : "展开学习"} <span>${opening ? "−" : "＋"}</span>`;
  }));
}

