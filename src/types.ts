/**
 * Type definitions for UK Public Procurement Document Registry
 */

export type DocumentCategory = 'ppn' | 'procurement_act' | 'npps' | 'general';

export type DocumentType = 
  | 'Policy Note'
  | 'Information Note'
  | 'Statutory Guidance'
  | 'Implementation Guide'
  | 'Technical Standard'
  | 'Defense & Security Standard'
  | 'Template'
  | 'Impact Assessment'
  | 'FAQ'
  | 'Policy Statement';

export type DocumentStatus = 'active' | 'superseded' | 'forthcoming';

export type CompliancePriority = 'High' | 'Medium' | 'Standard';

export interface ProcurementDoc {
  id: string;
  reference: string;
  title: string;
  category: DocumentCategory;
  categoryName: string;
  documentType: DocumentType;
  publicationDate: string; // YYYY-MM-DD
  lastUpdated: string;
  status: DocumentStatus;
  supersededBy?: string;
  supersededDoc?: string;
  targetAudience: string[];
  summary: string;
  keyObligations: string[];
  contractingAuthorityImpact: string;
  supplierImpact: string;
  thresholdRelevance: string;
  govukUrl: string;
  pdfUrl: string;
  fileSizeBytes: number;
  fileSizeKb: number;
  sha256: string;
  localPath: string;
  tags: string[];
  compliancePriority: CompliancePriority;
  applicableLegislation: 'Procurement Act 2023' | 'Public Contracts Regulations 2015' | 'Both / Transition';
}

export interface ScraperRunLog {
  id: string;
  timestamp: string;
  urlCrawled: string;
  status: number;
  action: 'crawled' | 'downloaded' | 'cached' | 'rate_limited' | 'robots_check';
  documentsFound: number;
  newDocuments: number;
  bytesDownloaded: number;
  rateLimitDelaySec: number;
  robotsStatus: 'Allowed' | 'Disallowed';
  message: string;
}

export interface ScraperStatus {
  isRunning: boolean;
  lastSyncTime: string | null;
  totalDocuments: number;
  categoryCounts: {
    ppn: number;
    procurement_act: number;
    npps: number;
  };
  totalPdfSizeBytes: number;
  robotsTxtCompliant: boolean;
  rateLimitDelaySec: number;
  userAgent: string;
  recentLogs: ScraperRunLog[];
}

export interface AiDocumentAnalysis {
  executiveSummary: string;
  effectiveDate: string;
  mandatoryRequirements: string[];
  recommendedBestPractices: string[];
  contractingAuthorityActions: Array<{ action: string; timeline: string; priority: 'High' | 'Medium' | 'Low' }>;
  supplierComplianceChecklist: string[];
  riskRating: 'High' | 'Medium' | 'Low';
  riskJustification: string;
  keyDefinitions: Record<string, string>;
  commercialImpactSummary: string;
}

export interface GroundedSearchResult {
  answer: string;
  citations: Array<{ title: string; url: string; snippet?: string }>;
  suggestedFollowUps: string[];
  timestamp: string;
}

export interface GoogleDocExportResult {
  docId: string;
  title: string;
  docUrl: string;
  createdAt: string;
  docRef: string;
}

export interface GoogleTaskExportResult {
  taskId: string;
  title: string;
  listTitle: string;
  due?: string;
  createdAt: string;
  docRef: string;
}

export type UserRole = 'supplier_bidder' | 'contracting_authority' | 'legal_consultant';

export interface TenderAnalysisRequest {
  tenderTitle: string;
  contractingAuthority?: string;
  estimatedValueGbp?: number;
  contractDurationYears?: number;
  sector?: 'Central Government' | 'Local Authority' | 'NHS / Healthcare' | 'Defence' | 'Education' | 'Infrastructure' | 'Utilities';
  tenderText: string;
  userRole: UserRole;
  applicableLegislationMode?: 'Procurement Act 2023' | 'PCR 2015' | 'Auto-Detect';
}

export interface TenderRegulationMatch {
  docReference: string;
  docTitle: string;
  category: DocumentCategory;
  relevanceReason: string;
  statutoryThreshold: string;
  isMandatoryPassFail: boolean;
  citationUrl: string;
  governingClause: string;
}

export interface TenderRiskItem {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  legalBasis: string;
  mitigationRecommendation: string;
  impactedParty: 'Bidder / Supplier' | 'Contracting Authority' | 'Both';
}

export interface TenderChecklistAction {
  id: string;
  category: 'Mandatory Pass/Fail' | 'Social Value & Net Zero' | 'Financial & Prompt Payment' | 'Cyber & Data' | 'Contract Management & KPIs';
  action: string;
  guidanceReference: string;
  priority: 'Immediate' | 'Pre-Submission' | 'Post-Award';
  requiredEvidence: string;
  completed?: boolean;
}

export interface TenderComplianceResult {
  id: string;
  scanTimestamp: string;
  tenderTitle: string;
  userRole: UserRole;
  estimatedValueGbp?: number;
  readinessScore: number; // 0 to 100
  complianceGrade: 'Audit-Ready (A)' | 'Substantially Compliant (B)' | 'Moderate Gaps (C)' | 'High Risk of Disqualification (D)';
  executiveSummary: string;
  matchedRegulations: TenderRegulationMatch[];
  criticalRisks: TenderRiskItem[];
  mandatoryChecklist: TenderChecklistAction[];
  socialValueStrategy: {
    recommendedThemes: string[];
    minimumSuggestedWeighting: string;
    modelClausesAdvice: string;
  };
  netZeroAdvice: {
    crpRequired: boolean;
    requiredScopes: string[];
    contractScheduleReference: string;
  };
  kpiRecommendations: string[];
  procurementProcedureRecommendation: {
    procedureType: string;
    justification: string;
    transparencyNoticesRequired: string[];
  };
}

export type SaaSTierId = 'free' | 'pro_bidder' | 'enterprise_authority';

export interface SaaSTier {
  id: SaaSTierId;
  name: string;
  tagline: string;
  monthlyPriceGbp: number;
  annualPriceGbp: number;
  targetUser: string;
  features: string[];
  badge?: string;
  buttonLabel: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin / Commercial Director' | 'Senior Bid Writer' | 'Legal Compliance Officer' | 'Procurement Lead';
  status: 'Active' | 'Invited';
}

export interface WhiteLabelSettings {
  companyName: string;
  reportHeaderTitle: string;
  referencePrefix: string;
  accentColor: string;
  complianceWatermark: boolean;
}

export interface BidCompanyProfile {
  companyName: string;
  companyNumber: string;
  registeredAddress: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  yearsTrading?: number;
  annualTurnoverGbp?: string;
  primarySector?: string;
  certifications: string[];
  socialValueCommitments?: string;
  netZeroTargetYear?: string;
  keyDifferentiators?: string;
  pastPerformanceSummary?: string;
}

export interface BidProposalSection {
  sectionId: string;
  title: string;
  statutoryAlignment: string;
  content: string;
  identifiedGaps: Array<{
    gapId: string;
    description: string;
    impactLevel: 'Critical' | 'Recommended' | 'Standard';
    evidenceRequired: string;
  }>;
  winThemeTags: string[];
  evaluatorRubricScoreEstimate: {
    scoreOutOf5: number;
    scoringRationale: string;
    tipToReachMaxScore: string;
  };
}

export interface WinStrategyAnalysis {
  overallWinProbabilityScore: number; // 0-100
  keyWinThemes: Array<{
    theme: string;
    valueProposition: string;
    proofPoint: string;
  }>;
  buyerHotButtons: string[];
  redTeamEvaluationFeedback: Array<{
    criterion: string;
    currentStrength: string;
    potentialWeakness: string;
    actionableCorrection: string;
  }>;
  priceQualityOptimalRatio: string;
  socialValueScoreMultiplier: string;
}

export interface BidProposalPackage {
  id: string;
  createdAt: string;
  tenderTitle: string;
  contractingAuthority: string;
  tenderReference: string;
  companyProfile: BidCompanyProfile;
  sections: BidProposalSection[];
  winStrategy: WinStrategyAnalysis;
  totalIdentifiedGaps: number;
  criticalGapsCount: number;
  statutoryChecklist: Array<{
    mandate: string;
    complianceStatus: 'Compliant' | 'Action Needed' | 'Verified';
    sectionRef: string;
  }>;
}

export interface BidProposalGenerationRequest {
  tenderTitle: string;
  contractingAuthority?: string;
  tenderReference?: string;
  tenderRequirementsText: string;
  evaluationCriteriaText?: string;
  companyProfile: BidCompanyProfile;
  tenderComplianceResult?: TenderComplianceResult;
}

