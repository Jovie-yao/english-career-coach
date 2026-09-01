import { phase12Vocabulary } from "./phase12-vocabulary-runtime.js";

const extraVocabulary = [
  {
    word: "priorities", partOfSpeech: "n. 名词", priority: "A", cefr: "B1",
    usIpa: "/praɪˈɔːrətiz/", ukIpa: "/praɪˈɒrətiz/",
    meaning: "优先事项；在当前阶段最需要先处理的事情。",
    collocations: [["set priorities", "设定优先事项"], ["shifting priorities", "不断变化的优先事项"]],
    wordFamily: ["priority (n.)", "prioritize (v.)"], memoryHint: "priority 是单数；priorities 是复数。",
    related: "priority = 优先事项；prioritize = 按重要性排序。",
    example: "I stay flexible when project priorities change.",
    interview: "说明你如何判断轻重缓急并应对变化。", daily: "适合讨论任务排序和计划调整。",
    mistake: "priorities 的中间音节较弱；不要与 properties 混淆。", speaking: "What do you do when priorities change?",
  },
  {
    word: "align", partOfSpeech: "v. 动词", priority: "A", cefr: "B2",
    usIpa: "/əˈlaɪn/", ukIpa: "/əˈlaɪn/",
    meaning: "使目标、理解或行动保持一致。",
    collocations: [["align with the team", "与团队保持一致"], ["align expectations", "统一预期"]],
    wordFamily: ["alignment (n.)", "aligned (adj.)"], memoryHint: "a + line：大家站到同一条线上。",
    related: "align 强调方向一致；coordinate 强调统筹安排。",
    example: "I align expectations before the team starts a new task.",
    interview: "用于说明你如何减少误解并统一团队方向。", daily: "适合会议确认、目标同步和任务交接。",
    mistake: "常用 align with someone 或 align something。", speaking: "How do you align with teammates?",
  },
  {
    word: "flexible", partOfSpeech: "adj. 形容词", priority: "B", cefr: "B1",
    usIpa: "/ˈfleksəbəl/", ukIpa: "/ˈfleksəbəl/",
    meaning: "灵活的；能够根据情况调整方法或计划。",
    collocations: [["stay flexible", "保持灵活"], ["a flexible approach", "灵活的方法"]],
    wordFamily: ["flexibility (n.)", "flexibly (adv.)"], memoryHint: "flex 表示弯曲；能弯而不断就是灵活。",
    related: "flexible 描述特质；adapt 描述调整的动作。",
    example: "I stay flexible when deadlines or priorities shift.",
    interview: "用于展示适应力以及面对变化时的稳定性。", daily: "适合谈时间、安排和工作方式。",
    mistake: "flexible 是形容词；名词是 flexibility。", speaking: "When do you need to stay flexible at work?",
  },
];

export const day1Expressions = [
  { phrase:"I would like to follow up on…", meaning:"我想跟进……", function:"跟进与推进", scenario:"邮件 / 会议后续", tone:"礼貌、专业", how:"后接名词、上次讨论或待办事项。", examples:["I would like to follow up on the timeline we discussed yesterday.","I’d like to follow up on my application for the coordinator role."], alternatives:"I’m checking in about… · I wanted to revisit…", use:"需要礼貌提醒、确认进度或延续讨论时。", avoid:"紧急事故或需要立即行动时，表达可能过于委婉。", prompt:"Follow up on a meeting, application, or task." },
  { phrase:"From my perspective,…", meaning:"从我的角度来看，……", function:"表达观点", scenario:"讨论 / 决策", tone:"尊重、审慎", how:"先承认这是个人视角，再给理由或证据。", examples:["From my perspective, the simpler option will be easier for customers.","From my perspective, we should test the idea before a full launch."], alternatives:"In my view,… · The way I see it,…", use:"团队意见不同，想清晰表达判断但保留协商空间时。", avoid:"陈述已经确认的客观事实时，不必弱化为个人观点。", prompt:"Share your view on a team decision." },
  { phrase:"Could you clarify…?", meaning:"你可以说明一下……吗？", function:"请求澄清", scenario:"会议 / 任务交接", tone:"礼貌、好奇", how:"后接不清楚的范围、期限、目标或术语。", examples:["Could you clarify which results should be included in the report?","Could you clarify what success would look like for this project?"], alternatives:"Could you explain what you mean by…? · Just to confirm,…", use:"信息模糊、存在多种理解或需要确认预期时。", avoid:"对方已经清楚回答多次时，应先复述自己的理解再问具体缺口。", prompt:"Ask for clarity about a deadline or expectation." },
];

export const dailyPlan = {
  schemaVersion: 1,
  week: 1,
  day: 1,
  theme: "Teamwork & Collaboration",
  goal: "Talk about how you work with different people and respond when priorities change.",
  estimate: "~50 min",
  vocabulary: [...phase12Vocabulary, ...extraVocabulary],
  expressions: day1Expressions,
  review: [
    { id: "coordinate", prompt: "How would you say “协调不同团队”?", answer: "coordinate with different teams" },
    { id: "adapt", prompt: "Complete: _____ quickly when priorities change.", answer: "adapt" },
    { id: "initiative", prompt: "What phrase means “主动采取行动”?", answer: "take the initiative" },
  ],
  quickRecall: {
    prompt: "Which word means “协调不同团队共同推进工作”?",
    options: ["contribute", "coordinate", "adapt", "prioritize"],
    answer: "coordinate",
  },
  shadowing: [
    "I coordinate with different teams and adapt quickly when priorities change.",
    "When priorities shift, I try to align with the team quickly and make sure everyone understands the next step.",
  ],
  speakingChallenge: {
    topic: "Teamwork & Collaboration",
    question: "Tell me about a time when you had to coordinate with different people to complete a task.",
    suggestedEnglish: ["coordinate", "adapt", "priorities", "work closely with", "take the initiative to"],
  },
  todaysEnglish: ["coordinate", "adapt", "priorities", "initiative", "work closely with", "take the initiative"],
};
