# 商业化埋点与指标监测方案

## 1. 概述 (Overview)

本方案旨在通过 GA4 (Google Analytics 4) 建立一套完整的数据追踪体系，重点验证商业化买量效果。方案覆盖**获客(Acquisition)**、**激活(Activation)**、**留存(Retention)** 和 **变现(Revenue)** 四个核心阶段，并支持按**国家/地区**和**语言**进行多维度下钻分析。

## 2. 全局维度与细分 (Dimensions & Segmentation)

为了区分不同市场的表现，我们需要利用 GA4 的自动采集属性和自定义用户属性。

### 2.1 自动采集维度 (无需额外开发)
*   **国家/地区 (Country/Region)**: GA4 根据用户 IP 自动识别。
*   **设备语言 (Device Language)**: 用户的浏览器/系统语言设置。
*   **流量来源 (Source/Medium)**: 识别买量渠道 (如 Google Ads, Facebook, TikTok) 和自然流量。

### 2.2 自定义用户属性 (User Properties)
需要在代码初始化或用户状态变更时上报。

| 属性名称 (Key) | 描述 (Description) | 示例值 (Example Values) | 用途 |
| :--- | :--- | :--- | :--- |
| `app_env` | 应用环境 (已实现) | `local`, `prod`, `oversea` | 区分测试与生产数据 |
| `app_language` | 应用内当前语言 | `en`, `cn`, `ja` | 分析不同语言版本的转化率 |
| `user_type` | 用户类型 | `visitor` (访客), `registered` (注册), `subscriber` (会员) | 区分高价值用户 |
| `plan_level` | 订阅等级 | `free`, `pro`, `premium` | 分析付费深度 |

## 3. 核心事件埋点设计 (Event Tracking)

### 3.1 流量与获客 (Acquisition & Landing)

| 事件名称 (Event Name) | 触发时机 (Trigger) | 关键参数 (Parameters) | 业务含义 |
| :--- | :--- | :--- | :--- |
| `page_view` | 页面加载 (GA4默认) | `page_location`, `page_referrer` | 基础流量 PV/UV |
| `landing_page_view` | 用户首次打开落地页 | `utm_source`, `landing_path` | 衡量广告落地页的到达率 |

### 3.2 激活与互动 (Activation & Engagement)
针对 `ai-tarot`, `answer-book`, `palm-reading` 等核心功能。

#### 3.2.1 通用功能事件 (General Feature Events)
| 事件名称 (Event Name) | 触发时机 (Trigger) | 关键参数 (Parameters) | 业务含义 |
| :--- | :--- | :--- | :--- |
| `feature_start` | 用户开始功能 (如进入页面或点击开始) | `feature_name` (e.g., `ai_tarot`, `answer_book`, `palm_reading`) | 衡量功能活跃度 |
| `interpretation_generated` | 结果生成完成 | `feature_name`, `is_free` | 核心功能完成率 (Aha Moment) |

#### 3.2.2 塔罗占卜 (AI Tarot)
| 事件名称 | 触发时机 | 关键参数 |
| :--- | :--- | :--- |
| `select_spread` | 选择牌阵 | `spread_id` |
| `draw_cards` | 完成抽牌 | `spread_id`, `card_count` |
| `request_interpretation` | 点击“获取AI解读” | `question_length`, `tone`, `card_style` |

#### 3.2.3 答案之书 (Answer Book)
| 事件名称 | 触发时机 | 关键参数 |
| :--- | :--- | :--- |
| `reveal_answer` | 点击“揭示答案” | - |
| `ask_again` | 点击“再次提问” | - |

#### 3.2.4 掌纹识别 (Palm Reading)
| 事件名称 | 触发时机 | 关键参数 |
| :--- | :--- | :--- |
| `upload_palm_image` | 上传/拍摄手掌照片 | `upload_method` (camera/file) |
| `analyze_palm_start` | 点击“开始分析” | - |
| `analyze_palm_complete` | 分析完成并展示结果 | `palm_lines_detected` (count) |

### 3.3 商业化与变现 (Revenue & Monetization)
针对 `pricing`, `checkout` 流程。

| 事件名称 (Event Name) | 触发时机 (Trigger) | 关键参数 (Parameters) | 业务含义 |
| :--- | :--- | :--- | :--- |
| `view_item_list` | 进入定价页 (Pricing Page) | `list_name` (e.g., `pricing_page`) | 付费意愿漏斗 - 顶部 |
| `begin_checkout` | 点击订阅按钮 (跳转Stripe前) | `currency`, `value`, `items` (plan_name), `plan_period` | 付费意愿漏斗 - 中部 (点击即跳转) |
| `purchase` | 支付成功 (Success页面) | `transaction_id`, `value`, `currency`, `items` | **核心转化**: 实际收入 |

> **注意**: `purchase` 事件需要准确的金额和订单ID。当前 `success` 页面未获取这些信息。
> **改造要求**: 需要在 `pricing/page.tsx` 的 `success_url` 中通过 Stripe 模板添加 `?session_id={CHECKOUT_SESSION_ID}`，并在 Success 页通过 API 查询订单详情后上报。

## 4. 关键指标计算 (Key Metrics & KPIs)

### 4.1 转化率指标 (Conversion Rates)
*   **落地页到达率**: `landing_page_view` / 广告点击数
*   **注册转化率**: `sign_up` / `landing_page_view`
*   **解读完成率**: `interpretation_generated` / `request_interpretation` (衡量 AI 生成稳定性)
*   **付费转化率**: `purchase` / `landing_page_view`

### 4.2 商业价值指标 (Revenue Metrics)
*   **ARPU**: 总收入 / 活跃用户数
*   **ARPPU**: 总收入 / 付费用户数
*   **ROI**: (总收入 - 买量成本) / 买量成本

## 5. 买量效果验证流程 (Workflow)

1.  **UTM 参数部署**: 确保投放链接携带 `utm_source` 等参数。
2.  **受众细分**: 创建“未付费的高意向用户” (触发 `begin_checkout` 但未 `purchase`) 用于再营销。
3.  **A/B 测试**: 针对不同国家投放不同落地页。

## 6. 技术实施路径 (Implementation Path)

1.  **完善 `GA4Tracker.tsx`**: 封装 `trackEvent`。
2.  **页面接入**:
    *   **Pricing Page**: 在 `handleSubscribe` 中触发 `begin_checkout`。
    *   **Success Page**: **[关键改造]** 修改 Stripe `success_url` 配置，在前端根据 Session ID 获取订单详情并上报 `purchase`。
    *   **AI Tarot**: 在 `handleDraw`, `handleGetAiInterpretation` 和流式响应结束时分别打点。
    *   **Auth**: 在 `login` 和 `register` 成功回调中打点。


---
**Next Step**: 确认方案无误后，我可以在代码中封装通用的事件上报 hook 并逐步接入上述埋点。
