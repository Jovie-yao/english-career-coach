export const learningPriorities = {
  S: "核心高频",
  A: "高频实用",
  B: "场景词汇",
  C: "扩展词汇",
};

export function pronunciationVoice(voices, locale) {
  return voices.find((voice) => voice.lang.toLowerCase().startsWith(locale))
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
}

export function recordingErrorMessage(errorName) {
  if (errorName === "NotAllowedError") return "浏览器未获得麦克风权限，请允许访问麦克风后重试。";
  if (errorName === "NotFoundError") return "没有检测到可用麦克风，请检查设备连接。";
  return "当前浏览器暂不支持录音，建议使用最新版 Chrome 或 Edge。";
}

