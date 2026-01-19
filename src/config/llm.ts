/**
 * LLM (大语言模型) 配置
 * 使用 coze-coding-dev-sdk 集成
 */

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens?: number;
  thinking: 'enabled' | 'disabled';
  systemPrompt: string;
}

/**
 * AI 模型配置
 *
 * 可用模型：
 * - doubao-seed-1-6-thinking-250715: 豆包思考模型（推荐）
 * - doubao-seed-1-6-pro-250715: 豆包专业版
 * - doubao-seed-1-6-lite-250715: 豆包轻量版
 * - deepseek-chat: DeepSeek 聊天模型
 * - kimi-chat: Kimi 聊天模型
 *
 * 配置说明：
 * - model: 模型名称
 * - temperature: 温度参数 (0-2)，控制随机性
 * - thinking: 是否启用思考模式
 */
export const llmConfig: LLMConfig = {
  // 模型选择
  model: process.env.LLM_MODEL || 'doubao-seed-1-6-thinking-250715',
  
  // 温度参数：0 (更确定性) - 2 (更随机)
  temperature: Number(process.env.LLM_TEMPERATURE) || 0.8,
  
  // 最大 token 数（可选）
  maxTokens: process.env.LLM_MAX_TOKENS ? Number(process.env.LLM_MAX_TOKENS) : undefined,
  
  // 思考模式：enabled (启用) / disabled (禁用)
  thinking: (process.env.LLM_THINKING as 'enabled' | 'disabled') || 'enabled',
  
  // 系统提示词模板
  systemPrompt: `你是一位专业的塔罗牌解读师，拥有丰富的经验和深刻的洞察力。你的任务是：
1. 根据用户的问题和抽出的牌面，提供专业、深入、有启发性的解读
2. 结合每张牌的含义和位置，分析它们之间的关联和整体含义
3. 给出实用的建议和指导
4. 语言要温暖、富有同理心，同时保持神秘和专业的风格
5. 解读要全面但不冗长，重点突出

解读格式：
- 开头：简要概括整体牌面氛围
- 中间：逐张牌的详细解读（结合位置含义）
- 结尾：整体分析和建议`,
};

/**
 * 验证 LLM 配置是否有效
 */
export function validateLLMConfig(): boolean {
  return !!(llmConfig.model && llmConfig.temperature >= 0 && llmConfig.temperature <= 2);
}
