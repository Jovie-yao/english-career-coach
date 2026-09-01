export const SESSION_KEY = "ecc.dailySession.v1.3.0.day1";
export const STAGES = ["review", "learn", "shadow", "speak", "wrapup"];

export function freshSession() {
  return {schemaVersion:1,status:"notStarted",currentStage:"review",startedAt:null,lastActiveAt:null,elapsedSeconds:0,reviewResults:{},learnedVocabulary:[],learnedExpressions:[],quickRecall:null,shadowCompleted:[],speakingAttempt:null,selfReview:null,completedAt:null};
}

export function loadSession() {
  try {
    const saved=JSON.parse(localStorage.getItem(SESSION_KEY)||"null");
    if(!saved||saved.schemaVersion!==1)return freshSession();
    return {...freshSession(),...saved,reviewResults:saved.reviewResults||{},learnedVocabulary:Array.isArray(saved.learnedVocabulary)?saved.learnedVocabulary:[],learnedExpressions:Array.isArray(saved.learnedExpressions)?saved.learnedExpressions:[],shadowCompleted:Array.isArray(saved.shadowCompleted)?saved.shadowCompleted:[]};
  } catch { return freshSession(); }
}

export function saveSession(state) {
  state.lastActiveAt=new Date().toISOString();
  localStorage.setItem(SESSION_KEY,JSON.stringify(state));
  return state;
}

export function stageCompletion(state, stage) {
  if(stage==="review")return Math.min(1,Object.keys(state.reviewResults).length/3);
  if(stage==="learn"){
    if(state.learnedVocabulary.length>=8&&state.learnedExpressions.length>=3&&state.quickRecall!==null)return 1;
    return Math.min(1,(state.learnedVocabulary.length/8*.7)+(state.learnedExpressions.length/3*.2)+(state.quickRecall!==null ? .1 : 0));
  }
  if(stage==="shadow")return Math.min(1,state.shadowCompleted.length/2);
  if(stage==="speak")return state.speakingAttempt?(state.selfReview?1:.85):0;
  return state.completedAt?1:0;
}

export function progress(state) {
  const weights={review:20,learn:30,shadow:20,speak:25,wrapup:5};
  return Math.round(STAGES.reduce((sum,s)=>sum+stageCompletion(state,s)*weights[s],0));
}

export function nextTask(state) {
  if(stageCompletion(state,"review")<1)return "Complete today’s review";
  if(stageCompletion(state,"learn")<1)return "Finish today’s words and expressions";
  if(stageCompletion(state,"shadow")<1)return "Complete both shadowing sentences";
  if(stageCompletion(state,"speak")<1)return "Record and review your speaking challenge";
  return state.completedAt?"Day 1 complete":"Review your session and finish Day 1";
}
