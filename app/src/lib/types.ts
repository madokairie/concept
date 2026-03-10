export type ProjectType = 'self' | 'client';
export type ProjectStatus = 'designing' | 'concept_fixed' | 'launched' | 'result_recorded';
export type PhaseStatus = 'pending' | 'in_progress' | 'completed';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  clientName?: string;
  status: ProjectStatus;
  styleMode: 'default' | 'custom';
  createdAt: string;
  updatedAt: string;
  phases: PhaseData;
  results?: LaunchResult;
}

export interface PhaseData {
  phase0: PhaseInfo; // ゴール定義
  phase1a: PhaseInfo; // ターゲットインサイト
  phase1b: PhaseInfo; // パーソナル情報
  phase1c: PhaseInfo; // スタイルシート
  phase2: PhaseInfo; // コンセプト設計
}

export interface PhaseInfo {
  status: PhaseStatus;
  data: Record<string, string>;
  output?: string;
  evalScore?: EvalScore;
}

export interface EvalScore {
  targetMatch: number; // ターゲットの本音と一致しているか (1-10)
  styleCompliance: number; // スタイルシート準拠 (1-10)
  originality: number; // 独自性 (1-10)
  humanLike: number; // AI臭さがないか (1-10)
  consistency: number; // コンセプトとの一貫性 (1-10)
  actionDriving: number; // 次のステップに進みたくなるか (1-10)
}

export interface LaunchResult {
  listCount: number; // リスト登録数
  applicationCount: number; // 申込数
  cvr: number; // CVR (自動計算)
  revenue: number; // 売上
  recordedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  phaseTag?: string; // どのPhaseに関連する発言か
}

export interface MaterialFile {
  id: string;
  name: string;
  category: 'line' | 'lp' | 'seminar' | 'voice' | 'other';
  content: string;
  uploadedAt: string;
}

export const PHASE_LABELS: Record<string, { label: string; title: string; color: string }> = {
  phase0: { label: 'PHASE 0', title: 'ゴール定義', color: '#C8A96E' },
  phase1a: { label: 'PHASE 1-A', title: 'ターゲットインサイト', color: '#7B9E87' },
  phase1b: { label: 'PHASE 1-B', title: 'パーソナル情報', color: '#9B8BB4' },
  phase1c: { label: 'PHASE 1-C', title: 'スタイルシート', color: '#C47A5A' },
  phase2: { label: 'PHASE 2', title: 'コンセプト設計', color: '#5B8FA8' },
};
