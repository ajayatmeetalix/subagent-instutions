"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { Home, Briefcase, FileText, Trash2, Users, Building2, Copy, ChevronRight, ArrowLeft, Download, Plus, Menu, RefreshCw, User, CreditCard, DollarSign, Lock, Clipboard, UserCircle, BarChart3, FileCheck, UserPlus, CircleDollarSign, MousePointer, FolderOpen, Search, Edit, Folder, Grid, Upload, FolderPlus, MoreVertical, Trash, Edit2, X, File, CheckCircle, Image, FileImage, FolderInput, Eye, CalendarDays, Clock, CheckCircle2, AlertCircle, Loader2, AlertTriangle, Ban, ChevronDown, ClipboardList, ArrowRight, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const DEADLINE_CATEGORIES = [
  {
    key: "immediate",
    label: "Immediate actions",
    subtitle: "First 30 days from death",
    triggerLabel: "Date of death",
    triggerKeyword: "closed won",
    preview: ["Secure assets", "Notify beneficiaries", "Lodge will with court"],
    items: [
      { title: "Secure and inventory assets", defaultValue: 30, unit: "days" as const, description: "Identify, secure, and document all estate assets before they can be lost, stolen, or deteriorate in value." },
      { title: "Notify beneficiaries", defaultValue: 30, unit: "days" as const, description: "Inform all named beneficiaries of the death and their interest in the estate." },
      { title: "Lodge original will with court", defaultValue: 30, unit: "days" as const, description: "File the original will with the probate court. Most states require this within 30 days of learning of the death." },
      { title: "Notify financial institutions", defaultValue: 30, unit: "days" as const, description: "Alert banks, brokerages, and financial institutions of the death to prevent unauthorized access." },
    ]
  },
  {
    key: "probate",
    label: "Opening probate",
    subtitle: "30–60 days from death",
    triggerLabel: "Date of death",
    triggerKeyword: "closed won",
    preview: ["File petition", "Serve notice to heirs", "Publish notice"],
    items: [
      { title: "File petition to open probate", defaultValue: 30, unit: "days" as const, description: "File petition with the probate court to begin formal estate administration." },
      { title: "Serve notice of petition to heirs", defaultValue: 45, unit: "days" as const, description: "Serve all heirs and beneficiaries with notice of the petition before the court hearing." },
      { title: "Publish notice in newspaper", defaultValue: 45, unit: "days" as const, description: "Publish notice of probate proceedings in a newspaper of general circulation in the county." },
      { title: "File probate notes / examiner review", defaultValue: 50, unit: "days" as const, description: "Submit required probate notes or examiner review documents before the scheduled hearing." },
    ]
  },
  {
    key: "creditor",
    label: "Creditor claim window",
    subtitle: "From letters issuance",
    triggerLabel: "Letters issued",
    triggerKeyword: "letters",
    preview: ["Notify known creditors", "Creditor claim period", "Allow or reject claims"],
    items: [
      { title: "Notify known creditors", defaultValue: 30, unit: "days" as const, description: "Send written notice of the death to all known creditors of the estate." },
      { title: "File inventory and appraisal", defaultValue: 120, unit: "days" as const, description: "File a complete inventory and appraisal of all estate assets with the court." },
      { title: "Creditor claim period closes", defaultValue: 4, unit: "months" as const, description: "The deadline by which all creditors must file claims. No final distribution can occur until this window closes." },
      { title: "Allow or reject each creditor claim", defaultValue: 30, unit: "days" as const, description: "The executor must formally allow or reject each creditor claim filed. Failure to respond may constitute automatic allowance." },
    ]
  },
  {
    key: "small-estate",
    label: "Small estate affidavit",
    subtitle: "Waiting period from death",
    triggerLabel: "Date of death",
    triggerKeyword: "closed won",
    preview: ["Mandatory waiting period", "File small estate affidavit"],
    items: [
      { title: "Minimum waiting period before filing", defaultValue: 40, unit: "days" as const, description: "Mandatory waiting period before a small estate affidavit can be submitted. Filing before this window will result in rejection." },
    ]
  },
  {
    key: "tax",
    label: "Tax returns",
    subtitle: "Calendar-based deadlines",
    triggerLabel: "Date of death",
    triggerKeyword: "closed won",
    preview: ["Final Form 1040", "Form 706 (estate tax)", "Form 1041"],
    items: [
      { title: "Final Form 1040 (personal income tax)", defaultValue: 270, unit: "days" as const, description: "Due April 15 of the year following death. Adjust the calculated date to the actual April 15 deadline." },
      { title: "Form 706 (federal estate tax return)", defaultValue: 270, unit: "days" as const, description: "Due 9 months from date of death. Only required for estates exceeding the federal exemption threshold." },
      { title: "Form 1041 (estate income tax return)", defaultValue: 270, unit: "days" as const, description: "Due April 15 if the estate earns $600 or more in gross income during administration." },
    ]
  },
  {
    key: "trust",
    label: "Trust administration",
    subtitle: "From death or trust event",
    triggerLabel: "Date of death",
    triggerKeyword: "closed won",
    preview: ["Notice to beneficiaries", "Contest window", "Inventory assets"],
    items: [
      { title: "Notice to trust beneficiaries", defaultValue: 60, unit: "days" as const, description: "The trustee must notify all beneficiaries and heirs of the trust's existence and their rights." },
      { title: "Beneficiary trust contest window", defaultValue: 120, unit: "days" as const, description: "Window for beneficiaries to contest the trust, typically measured from when notice was mailed." },
      { title: "File inventory of trust assets", defaultValue: 120, unit: "days" as const, description: "Compile and file a complete inventory of all assets held within the trust." },
    ]
  },
  {
    key: "will-contest",
    label: "Will contests",
    subtitle: "From probate filing",
    triggerLabel: "Date of death",
    triggerKeyword: "closed won",
    preview: ["Will contest deadline"],
    items: [
      { title: "Will contest deadline", defaultValue: 90, unit: "days" as const, description: "Deadline for any interested party to contest the validity of the will. This window varies significantly by state." },
    ]
  },
  {
    key: "court-filings",
    label: "Court filings",
    subtitle: "From letters issuance",
    triggerLabel: "Letters issued",
    triggerKeyword: "letters",
    preview: ["File accounting", "Submit to beneficiaries", "Petition to close"],
    items: [
      { title: "File accounting with court", defaultValue: 12, unit: "months" as const, description: "File a formal accounting of all estate income, expenses, and distributions with the probate court." },
      { title: "Submit accounting to beneficiaries", defaultValue: 12, unit: "months" as const, description: "Provide all beneficiaries with a copy of the estate accounting prior to filing with the court." },
      { title: "File petition to close estate", defaultValue: 18, unit: "months" as const, description: "File petition with the probate court to formally close the estate once all obligations are settled and distributions are complete." },
    ]
  },
  {
    key: "gov-notices",
    label: "Government notices",
    subtitle: "From letters issuance",
    triggerLabel: "Letters issued",
    triggerKeyword: "letters",
    preview: ["Notice to heirs", "FTB notification (CA)", "DHHS / Medicaid notice"],
    items: [
      { title: "Mail notice to heirs", defaultValue: 30, unit: "days" as const, description: "Send formal written notice to all heirs of the estate. Required in most states within 30 days of letters issuance." },
      { title: "Notify Franchise Tax Board (CA)", defaultValue: 90, unit: "days" as const, description: "Send written notice of the death to the California Franchise Tax Board. Required for California estates with state tax obligations." },
      { title: "File notice with DHHS / Medicaid", defaultValue: 90, unit: "days" as const, description: "Notify the Department of Health and Human Services or applicable state Medicaid agency of the death to initiate benefits recovery review." },
    ]
  },
]

const JOBS_BOARD_TASKS = [
  {
    id: "t1",
    slug: "validate_legal_administration_path",
    title: "Validate Legal Administration Path",
    assignee: "MitchStage OlivetoStage",
    assigneeEmail: "mitch+stag...",
    reviewer: "delaney.haley@meetalix.com",
    createdAt: "Apr 7, 2026 5:49 PM",
    updatedAt: "Apr 7, 2026 5:49 PM",
    status: "todo",
    priority: "",
    jobVersion: 1,
    jobId: "5e3f6a3a-d183-4d04-830b-f70be6ff0a6e",
    steps: { done: 0, total: 7 },
    description: "The legal administration path is ready for your review. SAUL has evaluated the estate's asset values against jurisdiction thresholds and recommended the correct legal path. Review the threshold evaluation and SAUL's recommendation, override if needed, and approve to proceed to plan generation.",
    stepItems: [
      { id: 1, text: "Review the threshold evaluation — probate estate value vs. SEA threshold." },
      { id: 2, text: "Review the recommended primary path and SAUL's rationale." },
      { id: 3, text: "Review the parallel tracks that will run alongside probate." },
      { id: 4, text: "Override the primary path if SAUL's determination is incorrect — a reason is required." },
      { id: 5, text: "Approve the legal path to trigger probate plan generation." },
    ],
  },
  {
    id: "t2",
    slug: "validate_asset_classification",
    title: "Validate Asset Classification",
    assignee: "MitchStage OlivetoStage",
    assigneeEmail: "mitch+stag...",
    reviewer: "delaney.haley@meetalix.com",
    createdAt: "Apr 7, 2026 5:52 PM",
    updatedAt: "Apr 7, 2026 5:52 PM",
    status: "todo",
    priority: "",
    jobVersion: 1,
    jobId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    steps: { done: 0, total: 7 },
    description: "The asset classification is ready for your review. SAUL has classified each estate asset into a transfer bucket based on titling, ownership structure, and beneficiary designations. Review the results, confirm or override any bucket, and approve to proceed to legal path determination.",
    stepItems: [
      { id: 1, text: "Review SAUL's classification for each asset. Check the bucket, rationale, and confidence score." },
      { id: 2, text: "For any unvalidated assets (missing titling data), note that the classification is provisional." },
      { id: 3, text: "Override any bucket where SAUL's determination is incorrect — a reason is required per override." },
      { id: 4, text: "Use '+ Add and re-classify asset' if any estate assets are missing from the list." },
      { id: 5, text: "Confirm the blocked paths section reflects what you know about this estate." },
      { id: 6, text: "Approve classification to trigger legal path determination." },
    ],
  },
  {
    id: "t3",
    slug: "validate_probate_plan",
    title: "Validate Probate Plan",
    assignee: "MitchStage OlivetoStage",
    assigneeEmail: "mitch+stag...",
    reviewer: "delaney.haley@meetalix.com",
    createdAt: "Apr 8, 2026 9:00 AM",
    updatedAt: "Apr 8, 2026 9:00 AM",
    status: "todo",
    priority: "",
    jobVersion: 1,
    jobId: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    steps: { done: 0, total: 5 },
    description: "The settlement plan is ready for your review. SAUL has synthesized the approved asset classifications and legal path to generate a comprehensive, track-by-track estate settlement plan. Review all required actions, mark any inapplicable steps as N/A with a reason, and approve to activate all downstream work.",
    stepItems: [
      { id: 1, text: "Review the missed deadline flag and note any immediate actions required." },
      { id: 2, text: "Review the estate summary — approved path, probate value, asset breakdown." },
      { id: 3, text: "Review each track's action plan: Probate, Trust, SEA, and Non-probate." },
      { id: 4, text: "Mark any actions as N/A that don't apply to this estate — a reason is required per action." },
      { id: 5, text: "Approve the plan to activate all downstream filing and administration jobs." },
    ],
  },
  {
    id: "t4",
    slug: "revalidate_asset_classification",
    title: "Re-validate Asset Classification",
    assignee: "MitchStage OlivetoStage",
    assigneeEmail: "mitch+stag...",
    reviewer: "delaney.haley@meetalix.com",
    createdAt: "Apr 8, 2026 9:00 AM",
    updatedAt: "Apr 8, 2026 9:00 AM",
    status: "todo",
    priority: "",
    jobVersion: 1,
    jobId: "c4d5e6f7-a8b9-0123-cdef-456789012345",
    steps: { done: 0, total: 3 },
    description: "A new asset was identified after initial classification was approved. SAUL has re-classified the asset. Review the result, override if needed, and approve to update the estate record.",
    stepItems: [
      { id: 1, text: "Review SAUL's classification for the newly identified asset." },
      { id: 2, text: "Override the bucket if SAUL's determination is incorrect — a reason is required." },
      { id: 3, text: "Approve to update the classification record." },
    ],
  },
  { id: "c1", slug: "review_new_settlement_starting_point", title: "New Settlement Created - Please review", assignee: "Admin Test", assigneeEmail: "", reviewer: "", createdAt: "Apr 6, 2026 2:40 PM", updatedAt: "Apr 6, 2026 2:40 PM", status: "completed", priority: "", jobVersion: 1, jobId: "", steps: { done: 3, total: 3 }, description: "", stepItems: [] },
  { id: "c2", slug: "notify_the_va_of_the_decedent", title: "Notify the VA of the Decedent's Passing", assignee: "Admin Test", assigneeEmail: "", reviewer: "", createdAt: "Apr 6, 2026 3:14 PM", updatedAt: "Apr 6, 2026 3:14 PM", status: "completed", priority: "", jobVersion: 1, jobId: "", steps: { done: 3, total: 3 }, description: "", stepItems: [] },
  { id: "c3", slug: "define_plan_for_probate_lawyer", title: "Define plan for probate lawyer engagement", assignee: "Admin Test", assigneeEmail: "", reviewer: "", createdAt: "Apr 6, 2026 3:18 PM", updatedAt: "Apr 6, 2026 3:18 PM", status: "completed", priority: "", jobVersion: 1, jobId: "", steps: { done: 2, total: 2 }, description: "", stepItems: [] },
]

const SAUL_CLASSIFICATION_RESPONSE = {
  classification: {
    assets: [
      { asset: "Income Property Apartment", bucket: "PROBATE", reason: "Sole ownership real estate requires probate for transfer.", confidence: 0.95, validated: true },
      { asset: "Trading Account", bucket: "PROBATE", reason: "Brokerage account without POD/TOD designation requires probate.", confidence: 0.88, validated: true },
      { asset: "Primary Savings Account", bucket: "PROBATE", reason: "Savings account without POD/TOD designation requires probate.", confidence: 0.88, validated: true },
      { asset: "Rental income from 22 University", bucket: "PROBATE", reason: "Income received after death is part of the probate estate.", confidence: 0.72, validated: false, validation_note: "Classification may change when titling is confirmed." },
      { asset: "Money Owed to Decedent", bucket: "PROBATE", reason: "Unvalidated money owed is part of the probate estate.", confidence: 0.61, validated: false, validation_note: "Classification may change when titling is confirmed." },
      { asset: "Family Home", bucket: "TRUST", reason: "Property owned by a trust is transferred through trust administration.", confidence: 0.97, validated: true },
      { asset: "Art Collection", bucket: "PROBATE", reason: "Personal property exceeding SEA threshold requires probate.", confidence: 0.74, validated: true },
      { asset: "Vehicle (Kia Soul)", bucket: "SMALL_ESTATE_AFFIDAVIT", reason: "Vehicle can be transferred using DMV REG 5 without probate.", confidence: 0.93, validated: true },
      { asset: "Life Insurance", bucket: "POD_TOD", reason: "Life insurance with a named beneficiary transfers directly to the named beneficiary outside probate.", confidence: 0.96, validated: true },
      { asset: "Retirement Account (401k)", bucket: "POD_TOD", reason: "Retirement account with a named beneficiary transfers directly outside probate.", confidence: 0.96, validated: true },
    ],
  },
  plan: {
    actions: [
      { description: "File death claim with State Farm for life insurance.", deadline: "As soon as practicable", required_forms: [] },
      { description: "Contact Fidelity with certified death certificate for 401k transfer.", deadline: "As soon as practicable", required_forms: [] },
      { description: "Distribute Family Home per trust terms.", deadline: "As soon as practicable", required_forms: [] },
      { description: "Complete DMV Form REG 5 for vehicle transfer.", deadline: "As soon as practicable", required_forms: ["REG 5"] },
      { description: "Initiate formal probate for remaining assets.", deadline: "As soon as practicable", required_forms: ["DE-111", "DE-160", "DE-161"] },
      { description: "File Change in Ownership Statement for real property.", deadline: "2025-10-12", required_forms: ["BOE-502-D"] },
    ],
    flags: [
      { type: "MISSED_DEADLINE", description: "Lodge original will with court was due Jun 14, 2025. Court may impose penalties under §8200.", severity: "HIGH" },
    ],
    blocked_paths: [
      { procedure: "Spousal Property Petition (§13500)", reason: "Unavailable — no surviving spouse." },
      { procedure: "Spousal Wage Affidavit", reason: "Unavailable — no surviving spouse." },
    ],
  },
}

const BUCKET_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PROBATE: { label: "Probate", bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
  TRUST: { label: "Trust", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  SMALL_ESTATE_AFFIDAVIT: { label: "Small estate affidavit", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  POD_TOD: { label: "POD / TOD", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  COMMUNITY_PROPERTY: { label: "Community property", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  JOINT_TENANCY: { label: "Joint tenancy", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  SPOUSAL_TRANSFER: { label: "Spousal transfer", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  UNVALIDATED: { label: "Unvalidated — provisional", bg: "bg-gray-50", text: "text-gray-400", border: "border-gray-200" },
}

const BUCKET_OPTIONS = ["PROBATE", "TRUST", "SMALL_ESTATE_AFFIDAVIT", "POD_TOD", "COMMUNITY_PROPERTY", "JOINT_TENANCY", "SPOUSAL_TRANSFER"]

const SAUL_LEGAL_PATH_RESPONSE = {
  threshold_evaluation: {
    SEA: { countable_value: 485000, threshold: 184500, exceeds_threshold: true, qualified: false },
    PROBATE: { countable_value: 485000, threshold: 184500, exceeds_threshold: true, qualified: true },
  },
  legal_path: {
    primary: "PROBATE_INDEPENDENT_ADMINISTRATION",
    parallel_tracks: [
      { track: "TRUST_ADMINISTRATION", assets: ["Family Home"] },
      { track: "SMALL_ESTATE_AFFIDAVIT", assets: ["Vehicle (Kia Soul)"] },
      { track: "NON_PROBATE", assets: ["Life Insurance", "Retirement Account (401k)"] },
    ],
    reason: "Probate estate exceeds SEA threshold. No surviving spouse. Will exists — Independent Administration of Estates Act applies.",
  },
  plan: {
    actions: [
      { description: "File DMV Form REG 5 for vehicle transfer.", deadline: "As soon as practicable", required_forms: ["REG 5"], track: "SMALL_ESTATE_AFFIDAVIT" },
      { description: "Contact State Farm with certified death certificate to claim life insurance.", deadline: "As soon as practicable", required_forms: ["DEATH_CERTIFICATE"], track: "NON_PROBATE" },
      { description: "Contact Fidelity with certified death certificate for 401k transfer.", deadline: "As soon as practicable", required_forms: ["DEATH_CERTIFICATE"], track: "NON_PROBATE" },
      { description: "Distribute Family Home per trust terms.", deadline: "As soon as practicable", required_forms: [], track: "TRUST_ADMINISTRATION" },
      { description: "File petition for probate (DE-111) with supporting inventory (DE-160, DE-161).", deadline: "As soon as practicable", required_forms: ["DE-111", "DE-160", "DE-161"], track: "PROBATE" },
      { description: "File Change in Ownership Statement for real property.", deadline: "2025-10-12", required_forms: ["BOE-502-D"], track: "PROBATE" },
    ],
    flags: [
      { type: "MISSED_DEADLINE", description: "Lodge original will with court was due Jun 14, 2025. Court may impose penalties under §8200.", severity: "HIGH" },
    ],
    blocked_paths: [
      { procedure: "Small Estate Affidavit (§13100)", reason: "Probate estate value ($485,000) exceeds SEA threshold ($184,500)." },
      { procedure: "Spousal Property Petition (§13500)", reason: "No surviving spouse." },
      { procedure: "Spousal Wage Affidavit", reason: "No surviving spouse." },
    ],
  },
}

const SAUL_PROBATE_PLAN_RESPONSE = {
  estate_summary: {
    estate_name: "Estate of Microsoft Zune",
    approved_path: "PROBATE_INDEPENDENT_ADMINISTRATION",
    parallel_tracks: ["TRUST_ADMINISTRATION", "SMALL_ESTATE_AFFIDAVIT", "NON_PROBATE"],
    probate_estate_value: 485000,
    total_assets: 10,
    probate_assets: 6,
    non_probate_assets: 4,
    jurisdiction: "California",
    summary: "This estate requires formal probate under Independent Administration of Estates Act (IAEA). Six assets totaling $485,000 must pass through probate. Four assets transfer outside probate: the Family Home via trust administration, the Kia Soul via DMV REG 5, and life insurance and retirement accounts to named beneficiaries. There is one missed deadline requiring immediate attention.",
  },
  plan: {
    tracks: [
      {
        track: "PROBATE",
        label: "Probate — Independent Administration",
        description: "Formal probate required for 6 assets. IAEA authority allows independent action on most matters without court approval.",
        actions: [
          { id: "p1", description: "Lodge original will with the Superior Court.", deadline: "MISSED — was due Jun 14, 2025", required_forms: [], status: "overdue", note: "Court may impose penalties under §8200. Address before filing probate petition." },
          { id: "p2", description: "File Petition for Probate (DE-111) with the Superior Court.", deadline: "As soon as practicable", required_forms: ["DE-111"], status: "pending" },
          { id: "p3", description: "Publish Notice of Petition to Administer Estate in a newspaper of general circulation.", deadline: "Before hearing date", required_forms: [], status: "pending" },
          { id: "p4", description: "Attend probate hearing and obtain Letters Testamentary.", deadline: "Per court scheduling", required_forms: [], status: "pending" },
          { id: "p5", description: "Notify all known creditors of estate administration.", deadline: "30 days from Letters issuance", required_forms: [], status: "pending" },
          { id: "p6", description: "File Inventory and Appraisal of all probate assets (DE-160, DE-161). Probate referee will appraise: Income Property Apartment, Trading Account, Primary Savings Account, Rental Income, Money Owed to Decedent, Art Collection.", deadline: "4 months from Letters issuance", required_forms: ["DE-160", "DE-161"], status: "pending" },
          { id: "p7", description: "File Change in Ownership Statement (BOE-502-D) for Income Property Apartment.", deadline: "2025-10-12", required_forms: ["BOE-502-D"], status: "pending" },
          { id: "p8", description: "Pay validated debts and expenses from estate operating account.", deadline: "After creditor claim period closes (4 months from first publication)", required_forms: [], status: "pending" },
          { id: "p9", description: "File Petition for Final Distribution (DE-295) and accounting.", deadline: "After creditor period and all claims resolved", required_forms: ["DE-295"], status: "pending" },
        ],
      },
      {
        track: "TRUST_ADMINISTRATION",
        label: "Trust administration",
        description: "Family Home is trust-held and transfers outside probate via trust administration.",
        actions: [
          { id: "t1", description: "Send Notice to Trust Beneficiaries per Probate Code §16061.7.", deadline: "60 days from date of death", required_forms: [], status: "pending" },
          { id: "t2", description: "Obtain date-of-death valuation for Family Home for tax purposes.", deadline: "As soon as practicable", required_forms: [], status: "pending" },
          { id: "t3", description: "Distribute Family Home to trust beneficiaries per trust terms.", deadline: "After §16061.7 notice period (120 days)", required_forms: [], status: "pending" },
        ],
      },
      {
        track: "SMALL_ESTATE_AFFIDAVIT",
        label: "Small estate affidavit — vehicle",
        description: "Vehicle (Kia Soul) qualifies for DMV REG 5 transfer, excluded from the probate estate.",
        actions: [
          { id: "s1", description: "Complete DMV Form REG 5 to transfer Vehicle (Kia Soul) to successor.", deadline: "40 days from date of death", required_forms: ["REG 5"], status: "pending" },
        ],
      },
      {
        track: "NON_PROBATE",
        label: "Non-probate transfers",
        description: "Life Insurance and Retirement Account (401k) transfer directly to named beneficiaries outside probate.",
        actions: [
          { id: "n1", description: "File death benefit claim with State Farm for Life Insurance. Beneficiary receives proceeds directly.", deadline: "As soon as practicable", required_forms: ["DEATH_CERTIFICATE"], status: "pending" },
          { id: "n2", description: "Contact Fidelity with certified death certificate to initiate Retirement Account (401k) transfer to named beneficiary.", deadline: "As soon as practicable", required_forms: ["DEATH_CERTIFICATE"], status: "pending" },
        ],
      },
    ],
    sequencing_notes: [
      "Probate track: p1 (lodge will) → p2 (petition) → p3 (publish notice) → p4 (hearing + Letters) → p5 and p6 run in parallel after Letters issue → p8 after creditor period closes → p9 final distribution.",
      "Trust track runs independently of probate. t1 notice period (120 days) must clear before t3 distribution.",
      "SEA and Non-probate tracks can begin immediately — no dependency on probate Letters.",
    ],
    flags: [
      { type: "MISSED_DEADLINE", description: "Lodge original will with court was due Jun 14, 2025. Court may impose penalties under §8200. Address before filing probate petition.", severity: "HIGH" },
    ],
    blocked_paths: [
      { procedure: "Small Estate Affidavit §13100 (full estate)", reason: "Probate estate value ($485,000) exceeds SEA threshold ($184,500)." },
      { procedure: "Spousal Property Petition (§13500)", reason: "No surviving spouse." },
      { procedure: "Spousal Wage Affidavit", reason: "No surviving spouse." },
    ],
  },
}

const SAUL_REVALIDATE_ASSET = {
  asset: "Checking Account — Wells Fargo",
  bucket: "PROBATE",
  reason: "Bank account without POD/TOD designation requires probate.",
  confidence: 0.85,
  validated: true,
  isNew: true,
}

const LEGAL_PATH_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PROBATE: { label: "Probate", bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
  PROBATE_INDEPENDENT_ADMINISTRATION: { label: "Probate — Independent Administration", bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
  PROBATE_SUPERVISED: { label: "Probate — Supervised", bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
  TRUST_ADMINISTRATION: { label: "Trust administration", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  SMALL_ESTATE_AFFIDAVIT: { label: "Small estate affidavit", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  NON_PROBATE: { label: "Non-probate transfer", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  ANCILLARY_PROBATE: { label: "Ancillary probate", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
}

const LEGAL_PATH_OPTIONS = ["PROBATE_INDEPENDENT_ADMINISTRATION", "PROBATE_SUPERVISED", "TRUST_ADMINISTRATION", "SMALL_ESTATE_AFFIDAVIT", "NON_PROBATE", "ANCILLARY_PROBATE"]

export default function EstateManagementPage() {
  const [activeNav, setActiveNav] = useState("home")
  const [displayTestEstates, setDisplayTestEstates] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // Start closed on mobile
  const [selectedEstate, setSelectedEstate] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("assets")
  const [jobsSearch, setJobsSearch] = useState("")
  const [jobsPriority, setJobsPriority] = useState("all")
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskModalId, setTaskModalId] = useState<string | null>(null)
  const [taskStepChecked, setTaskStepChecked] = useState<Record<string, boolean>>({})
  const [taskModalTab, setTaskModalTab] = useState<"conversations" | "history">("conversations")
  const [taskComment, setTaskComment] = useState("")
  const [taskProcessing, setTaskProcessing] = useState<Record<string, boolean>>({ t2: true })
  const [taskError, setTaskError] = useState<Record<string, string | null>>({})
  const [classificationData, setClassificationData] = useState<typeof SAUL_CLASSIFICATION_RESPONSE | null>(null)
  const [classificationApproved, setClassificationApproved] = useState(false)
  const [bucketOverrides, setBucketOverrides] = useState<Record<number, string>>({})
  const [overrideReasons, setOverrideReasons] = useState<Record<number, string>>({})
  const [refreshingAssets, setRefreshingAssets] = useState(false)
  const [newClassifiedAssets, setNewClassifiedAssets] = useState<Array<{ asset: string; bucket: string; reason: string; confidence: number; validated: boolean; isNew: boolean }>>([])
  const [t4Ready, setT4Ready] = useState(false)
  const [t4Approved, setT4Approved] = useState(false)
  const [taskVisibility, setTaskVisibility] = useState<Record<string, boolean>>({ t1: false, t3: false, t4: false })
  const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>({})
  const [legalPathData, setLegalPathData] = useState<typeof SAUL_LEGAL_PATH_RESPONSE | null>(null)
  const [legalPathApproved, setLegalPathApproved] = useState(false)
  const [legalPathOverride, setLegalPathOverride] = useState<string | null>(null)
  const [legalPathOverrideReason, setLegalPathOverrideReason] = useState("")
  const [probatePlanData, setProbatePlanData] = useState<typeof SAUL_PROBATE_PLAN_RESPONSE | null>(null)
  const [probatePlanApproved, setProbatePlanApproved] = useState(false)
  const [naActions, setNaActions] = useState<Record<string, boolean>>({})
  const [naReasons, setNaReasons] = useState<Record<string, string>>({})

  const SAUL_ERROR_MESSAGES: Record<string, string> = {
    t2: "Classification failed — 2 assets are missing titling status: Money Owed to Decedent, Rental income from 22 University. Update these assets and retry.",
    t1: "Legal path evaluation failed — threshold data could not be retrieved for this jurisdiction. Retry or contact support.",
    t3: "Plan generation failed — could not retrieve required forms data for California probate. Retry or contact support.",
    t4: "Re-classification failed — could not process the new asset. Retry or contact support.",
  }

  const saulStartedRef = useRef<Set<string>>(new Set())

  const startSaulForTask = (taskId: string) => {
    setTaskProcessing(prev => ({ ...prev, [taskId]: true }))
    setTaskError(prev => ({ ...prev, [taskId]: null }))
    setTimeout(() => {
      if (Math.random() < 0.1) {
        setTaskError(prev => ({ ...prev, [taskId]: SAUL_ERROR_MESSAGES[taskId] ?? "An unexpected error occurred. Retry or contact support." }))
        setTaskProcessing(prev => ({ ...prev, [taskId]: false }))
      } else {
        if (taskId === "t2") setClassificationData(SAUL_CLASSIFICATION_RESPONSE)
        if (taskId === "t1") setLegalPathData(SAUL_LEGAL_PATH_RESPONSE)
        if (taskId === "t3") setProbatePlanData(SAUL_PROBATE_PLAN_RESPONSE)
        if (taskId === "t4") setT4Ready(true)
        setTaskProcessing(prev => ({ ...prev, [taskId]: false }))
      }
    }, 2500)
  }

  const handleRetryTask = (taskId: string) => {
    setTaskError(prev => ({ ...prev, [taskId]: null }))
    startSaulForTask(taskId)
  }

  const openTaskModal = (taskId: string) => {
    setTaskModalId(taskId)
    setTaskModalOpen(true)
    setBucketOverrides({})
    setOverrideReasons({})
    setClassificationApproved(false)
    setRefreshingAssets(false)
    setNewClassifiedAssets([])
    setT4Approved(false)
    setLegalPathOverride(null)
    setLegalPathOverrideReason("")
    setLegalPathApproved(false)
    setNaActions({})
    setNaReasons({})
    setProbatePlanApproved(false)
  }

  const handleApproveClassification = () => {
    setClassificationApproved(true)
    setTimeout(() => {
      setTaskModalOpen(false)
      setClassificationApproved(false)
      setTaskStatuses(prev => ({ ...prev, t2: "completed" }))
      setTaskVisibility(prev => ({ ...prev, t1: true }))
      startSaulForTask("t1")
    }, 2000)
  }

  const handleApproveLegalPath = () => {
    setLegalPathApproved(true)
    setTimeout(() => {
      setTaskModalOpen(false)
      setLegalPathApproved(false)
      setTaskStatuses(prev => ({ ...prev, t1: "completed" }))
      setTaskVisibility(prev => ({ ...prev, t3: true }))
      startSaulForTask("t3")
    }, 2000)
  }

  const handleApproveProbatePlan = () => {
    setProbatePlanApproved(true)
    setTimeout(() => {
      setTaskModalOpen(false)
      setProbatePlanApproved(false)
      setTaskStatuses(prev => ({ ...prev, t3: "completed" }))
    }, 2000)
  }

  const handleRefreshAssets = () => {
    setRefreshingAssets(true)
    setTimeout(() => {
      setNewClassifiedAssets([{ ...SAUL_REVALIDATE_ASSET }])
      setRefreshingAssets(false)
    }, 1500)
  }

  const handleApproveT4 = () => {
    setT4Approved(true)
    setTimeout(() => {
      setTaskModalOpen(false)
      setT4Approved(false)
      setTaskStatuses(prev => ({ ...prev, t4: "completed" }))
    }, 2000)
  }

  useEffect(() => {
    if (saulStartedRef.current.has("t2")) return
    saulStartedRef.current.add("t2")
    const timer = setTimeout(() => startSaulForTask("t2"), 1000)
    return () => clearTimeout(timer)
  }, [])

  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [folders, setFolders] = useState<Record<string, Array<{ name: string; modified: string }>>>({
    root: [
      { name: "Executor Documents", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Beneficiary Documents", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Partner Documents", modified: "Mon Nov 4 2024 by Alix" }
    ],
    "Executor Documents": [
      { name: "Accounts", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Cherished Memories", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Debts & Obligations", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Estate Settlements Docs", modified: "Wed Nov 6 2024 by Jolene Smith" },
      { name: "Fraud Notifications", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Miscellaneous", modified: "Mon Nov 4 2024 by Alix" },
      { name: "My Uploads", modified: "Thu May 29 2025 by MeetAlix" },
      { name: "Probate", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Real Estate", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Tax Documents", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Vehicles", modified: "Mon Nov 4 2024 by Alix" }
    ],
    "Beneficiary Documents": [],
    "Partner Documents": []
  })
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [editingFileValue, setEditingFileValue] = useState("")
  const [deleteFileConfirm, setDeleteFileConfirm] = useState<string | null>(null)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [fileToMove, setFileToMove] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewFile, setPreviewFile] = useState<{ name: string; type: string } | null>(null)
  const [vaultFolder, setVaultFolder] = useState<string | null>(null)
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false)
  const [newMilestoneName, setNewMilestoneName] = useState("")
  const [newMilestoneDate, setNewMilestoneDate] = useState("")
  const [newMilestoneDescription, setNewMilestoneDescription] = useState("")
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      name: "Closed WON",
      date: "Oct 12, 2024",
      description: "Estate case accepted and initiated."
    },
    {
      id: 2,
      name: "K.Y.C.",
      date: "Nov 1, 2024",
      description: "Know Your Customer verification completed."
    },
    {
      id: 3,
      name: "Determine Legal Path",
      date: "Feb 1, 2025",
      description: "Legal pathway for estate administration determined."
    },
    {
      id: 4,
      name: "File Tax Return",
      date: "Jul 12, 2025",
      description: "Estate tax return filed with appropriate authorities."
    }
  ])

  // Deadlines state
  const [showAddDeadlineModal, setShowAddDeadlineModal] = useState(false)
  // Two-step modal state
  const [deadlineModalStep, setDeadlineModalStep] = useState<1 | 2>(1)
  const [deadlineModalTrigger, setDeadlineModalTrigger] = useState<string | null>(null)
  // Checklist of selected items (all pre-checked by default)
  const [deadlineModalChecked, setDeadlineModalChecked] = useState<string[]>([])
  // Per-item window overrides (item title → value in unit)
  const [deadlineModalWindowOverrides, setDeadlineModalWindowOverrides] = useState<Record<string, number>>({})
  // Custom deadline path state
  const [newDeadlineTitle, setNewDeadlineTitle] = useState("")
  const [newDeadlineDueDate, setNewDeadlineDueDate] = useState("")
  const [newDeadlineDescription, setNewDeadlineDescription] = useState("")
  const [newDeadlineTrigger, setNewDeadlineTrigger] = useState("")
  const [newDeadlineWindow, setNewDeadlineWindow] = useState("")
  // Key date path state
  const [keyDates, setKeyDates] = useState<Array<{
    id: number
    title: string
    date: string
    notes: string
  }>>([
    {
      id: 1,
      title: "Letters Testamentary issued",
      date: "2025-02-14",
      notes: "Letters issued by Los Angeles County Superior Court. Used as trigger date for creditor claim window and government notice deadlines."
    },
    {
      id: 2,
      title: "EIN created",
      date: "2025-02-20",
      notes: "Federal Employer Identification Number obtained from the IRS for the estate. EIN: 92-XXXXXXX."
    },
    {
      id: 3,
      title: "Date of publication",
      date: "2025-02-28",
      notes: "Notice to creditors published in the Los Angeles Daily Journal for 3 consecutive weeks beginning this date."
    },
  ])
  const [newKeyDateTitle, setNewKeyDateTitle] = useState("")
  const [newKeyDateDate, setNewKeyDateDate] = useState("")
  const [newKeyDateNotes, setNewKeyDateNotes] = useState("")
  const [deadlines, setDeadlines] = useState<Array<{
    id: number
    title: string
    trigger: string
    window: string
    dueDate: string
    description: string
    completed: boolean
    completedAt: string | undefined
  }>>([
    {
      id: 1,
      title: "Notify FTB of death",
      trigger: "Letters issued",
      window: "90 days",
      dueDate: "2025-04-01",
      description: "Send written notice of death to the Franchise Tax Board along with a copy of the letters.",
      completed: false,
      completedAt: undefined
    },
    {
      id: 2,
      title: "Creditor claim period closes",
      trigger: "Letters issued",
      window: "4 months",
      dueDate: "2025-06-15",
      description: "Final date by which all creditors must file claims against the estate. No final distribution can occur until this window closes.",
      completed: false,
      completedAt: undefined
    }
  ])

  // File structure with files in folders
  const [files, setFiles] = useState<Record<string, Array<{ name: string; type: string; size: string; modified: string }>>>({
    "Accounts": [
      { name: "Bank_Statement_Jan2024.png", type: "image/png", size: "2.3 MB", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Investment_Account_Summary.pdf", type: "application/pdf", size: "1.1 MB", modified: "Tue Nov 5 2024 by Alix" },
      { name: "Retirement_Account_Details.pdf", type: "application/pdf", size: "856 KB", modified: "Mon Nov 4 2024 by Alix" },
    ],
    "Real Estate": [
      { name: "Property_Deed.pdf", type: "application/pdf", size: "3.2 MB", modified: "Wed Nov 6 2024 by Jolene Smith" },
      { name: "Home_Appraisal.pdf", type: "application/pdf", size: "1.8 MB", modified: "Wed Nov 6 2024 by Jolene Smith" },
      { name: "Property_Photo_Front.jpg", type: "image/jpeg", size: "4.5 MB", modified: "Mon Nov 4 2024 by Alix" },
    ],
    "Estate Settlements Docs": [
      { name: "Death_Certificate.pdf", type: "application/pdf", size: "425 KB", modified: "Wed Nov 6 2024 by Jolene Smith" },
      { name: "Will_Final.pdf", type: "application/pdf", size: "1.2 MB", modified: "Wed Nov 6 2024 by Jolene Smith" },
      { name: "Trust_Documents.pdf", type: "application/pdf", size: "2.1 MB", modified: "Wed Nov 6 2024 by Jolene Smith" },
    ],
    "Tax Documents": [
      { name: "Tax_Return_2023.pdf", type: "application/pdf", size: "892 KB", modified: "Mon Nov 4 2024 by Alix" },
      { name: "W2_Form_2023.pdf", type: "application/pdf", size: "245 KB", modified: "Mon Nov 4 2024 by Alix" },
    ],
    "Vehicles": [
      { name: "Car_Title.pdf", type: "application/pdf", size: "654 KB", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Vehicle_Registration.jpg", type: "image/jpeg", size: "1.2 MB", modified: "Mon Nov 4 2024 by Alix" },
    ],
  })

  const estates = [
    {
      id: "862831cb-8e8d-44b5-bde5-03583031d3cb",
      shortId: "862831cb-8e8d-...",
      name: "Microsoft Zune",
      executors: ["Click Me!"],
      highlight: true,
      status: "Active",
      createdAt: "12/18/2025",
      assignedTo: "None assigned",
      email: "estateof.rew5tgg.dev1@meetalix.com",
      scanBoxId: "00000025b",
      assets: [
        {
          type: "Primary Residence",
          address: "104 North Broadway",
          city: "Pennsville Township",
          state: "NJ",
          value: "$__.__",
          status: "Pending"
        }
      ]
    },
    {
      id: "34935a92-4667-...",
      shortId: "34935a92-4667-...",
      name: "Luke Skywalker",
      executors: ["Lea Skywalker"],
      status: "Churned",
      createdAt: "10/22/2024",
      assignedTo: "Clayton Noyes",
      email: "luke.skywalker@meetalix.com",
      assets: []
    },
    {
      id: "168a8b40-df79-...",
      shortId: "168a8b40-df79-...",
      name: "Bunny 2Folger",
      executors: ["Tim Timson"],
      status: "Active",
      createdAt: "09/14/2023",
      assignedTo: "None assigned",
      email: "bunny.folger@meetalix.com",
      assets: []
    },
    {
      id: "3668ef06-ca44-...",
      shortId: "3668ef06-ca44-...",
      name: "Admiral Holdo",
      executors: [],
      status: "Active",
      createdAt: "09/22/2023",
      assignedTo: "None assigned",
      email: "admiral.holdo@meetalix.com",
      assets: []
    },
    {
      id: "608454fd-aeea-...",
      shortId: "608454fd-aeea-...",
      name: "Mary Wright",
      executors: ["Lakisha Robinson"],
      status: "Active",
      createdAt: "05/27/2025",
      assignedTo: "None assigned",
      email: "mary.wright@meetalix.com",
      assets: []
    },
    {
      id: "93a1d97c-80f2-4...",
      shortId: "93a1d97c-80f2-4...",
      name: "Elvis Presley",
      executors: ["Don Donato", "Priscila Presley"],
      status: "Active",
      createdAt: "02/12/2025",
      assignedTo: "None assigned",
      email: "elvis.presley@meetalix.com",
      assets: []
    },
    {
      id: "3906ba77-d42d-...",
      shortId: "3906ba77-d42d-...",
      name: "Date Death",
      executors: [],
      status: "Active",
      createdAt: "12/02/2025",
      assignedTo: "None assigned",
      email: "date.death@meetalix.com",
      assets: []
    },
    {
      id: "430ce962-c0bd-...",
      shortId: "430ce962-c0bd-...",
      name: "iPod Nano",
      executors: [],
      status: "Active",
      createdAt: "05/30/2025",
      assignedTo: "None assigned",
      email: "ping.li@meetalix.com",
      assets: []
    },
    {
      id: "43e4107b-9320-...",
      shortId: "43e4107b-9320-...",
      name: "Afterrevert Boxintegration",
      executors: [],
      status: "Active",
      createdAt: "12/02/2025",
      assignedTo: "None assigned",
      email: "afterrevert@meetalix.com",
      assets: []
    },
    {
      id: "298a0f50-64ac-...",
      shortId: "298a0f50-64ac-...",
      name: "Wayne Kearns",
      executors: ["Sharra Romany"],
      status: "Active",
      createdAt: "05/07/2025",
      assignedTo: "None assigned",
      email: "wayne.kearns@meetalix.com",
      assets: []
    },
    {
      id: "e3387c69-2a3a-...",
      shortId: "e3387c69-2a3a-...",
      name: "New Box",
      executors: [],
      status: "Active",
      createdAt: "06/12/2025",
      assignedTo: "None assigned",
      email: "newbox@meetalix.com",
      assets: []
    },
    {
      id: "12b54d34-344a-...",
      shortId: "12b54d34-344a-...",
      name: "Emperor Palpatine",
      executors: [],
      status: "Active",
      createdAt: "07/06/2023",
      assignedTo: "David Tuffy, Sharif Nasr",
      email: "emperor@meetalix.com",
      assets: []
    },
  ]

  const [showEditEstatePage, setShowEditEstatePage] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [estateData, setEstateData] = useState<Record<string, any>>({})
  const [legalEditSection, setLegalEditSection] = useState<string | null>(null)
  const [legalEditForm, setLegalEditForm] = useState<any>({})
  // Sample data so prototypes look populated
  const [legalInfo, setLegalInfo] = useState<Record<string, any>>({
    "862831cb-8e8d-44b5-bde5-03583031d3cb": {
      authorityType: "Probate (Independent)",
      caseNumber: "24-PR-00412",
      jurisdiction: "Essex County Surrogate's Court",
      bondStatus: "Required",
      bondAmount: "25000",
      courtStreet: "465 Dr. Martin Luther King Jr. Blvd",
      courtCity: "Newark",
      courtState: "NJ",
      courtZip: "07102",
      courtPhone: "(973) 693-6800",
      courtWebsite: "https://www.njcourts.gov/courts/superior/surrogates",
      courtHoursPreset: "Mon–Fri, 8:30am–4:30pm",
      courtHoursNote: "",
      refereeName: "",
      refereePhone: "",
      refereeAddress: "",
      refereeEmail: "",
    }
  })

  // Folder management functions
  const handleRenameFolder = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) {
      setEditingFolder(null)
      return
    }

    const location = currentFolder || "root"
    const updatedFolders = { ...folders }
    
    // Update folder name in current location
    if (updatedFolders[location]) {
      updatedFolders[location] = updatedFolders[location].map(folder =>
        folder.name === oldName
          ? { ...folder, name: newName, modified: new Date().toLocaleString() + " by You" }
          : folder
      )
    }

    // If renaming a parent folder, update its key in the folders object
    if (updatedFolders[oldName]) {
      updatedFolders[newName] = updatedFolders[oldName]
      delete updatedFolders[oldName]
    }

    setFolders(updatedFolders)
    setEditingFolder(null)
  }

  const handleDeleteFolder = (folderName: string) => {
    const location = currentFolder || "root"
    const updatedFolders = { ...folders }
    
    // Remove folder from current location
    if (updatedFolders[location]) {
      updatedFolders[location] = updatedFolders[location].filter(
        folder => folder.name !== folderName
      )
    }

    // Remove folder's contents if it exists
    if (updatedFolders[folderName]) {
      delete updatedFolders[folderName]
    }

    setFolders(updatedFolders)
    setDeleteConfirm(null)
  }

  // File upload functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setUploadedFiles(prev => [...prev, ...filesArray])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files)
      setUploadedFiles(prev => [...prev, ...filesArray])
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadComplete = () => {
    // Here you would typically upload files to a server
    console.log('Uploading files:', uploadedFiles)
    
    // Reset and close modal
    setUploadedFiles([])
    setShowUploadModal(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // File management functions
  const handleRenameFile = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName || !currentFolder) {
      setEditingFile(null)
      return
    }

    const updatedFiles = { ...files }
    if (updatedFiles[currentFolder]) {
      updatedFiles[currentFolder] = updatedFiles[currentFolder].map(file =>
        file.name === oldName
          ? { ...file, name: newName, modified: new Date().toLocaleString() + " by You" }
          : file
      )
    }

    setFiles(updatedFiles)
    setEditingFile(null)
  }

  const handleDeleteFile = (fileName: string) => {
    if (!currentFolder) return

    const updatedFiles = { ...files }
    if (updatedFiles[currentFolder]) {
      updatedFiles[currentFolder] = updatedFiles[currentFolder].filter(
        file => file.name !== fileName
      )
    }

    setFiles(updatedFiles)
    setDeleteFileConfirm(null)
  }

  const handleMoveFile = (fileName: string, destinationFolder: string) => {
    if (!currentFolder || currentFolder === destinationFolder) {
      setShowMoveModal(false)
      setFileToMove(null)
      return
    }

    const updatedFiles = { ...files }
    
    // Find the file in current folder
    const fileToMove = updatedFiles[currentFolder]?.find(f => f.name === fileName)
    if (!fileToMove) return

    // Remove from current folder
    if (updatedFiles[currentFolder]) {
      updatedFiles[currentFolder] = updatedFiles[currentFolder].filter(
        file => file.name !== fileName
      )
    }

    // Add to destination folder
    if (!updatedFiles[destinationFolder]) {
      updatedFiles[destinationFolder] = []
    }
    updatedFiles[destinationFolder].push({
      ...fileToMove,
      modified: new Date().toLocaleString() + " by You"
    })

    setFiles(updatedFiles)
    setShowMoveModal(false)
    setFileToMove(null)
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <FileImage className="w-5 h-5 text-blue-500 flex-shrink-0" />
    }
    if (type === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
    }
    return <File className="w-5 h-5 text-[#6b675f] flex-shrink-0" />
  }

  const handlePreviewFile = (fileName: string, fileType: string) => {
    setPreviewFile({ name: fileName, type: fileType })
    setShowPreviewModal(true)
  }

  const handleDownloadFile = (fileName: string) => {
    alert(`Downloading ${fileName}`)
  }

  const handleAddMilestone = () => {
    if (!newMilestoneName || !newMilestoneDate) {
      alert("Please fill in at least the name and date fields")
      return
    }

    const newMilestone = {
      id: milestones.length + 1,
      name: newMilestoneName,
      date: newMilestoneDate,
      description: newMilestoneDescription || ""
    }

    setMilestones([...milestones, newMilestone])
    
    // Reset form
    setNewMilestoneName("")
    setNewMilestoneDate("")
    setNewMilestoneDescription("")
    setShowAddMilestoneModal(false)
  }

  const openEditModal = () => {
    if (!selectedEstate) return
    const saved = estateData[selectedEstate.id] || {}
    setEditForm({
      firstName: saved.firstName || "",
      middleName: saved.middleName || "",
      lastName: saved.lastName || "",
      suffix: saved.suffix || "",
      aliases: saved.aliases || [],
      gender: saved.gender || "",
      dateOfBirth: saved.dateOfBirth || "",
      dateOfDeath: saved.dateOfDeath || "",
      ssn: saved.ssn || "",
      identifications: saved.identifications || [],
      maritalStatus: saved.maritalStatus || "",
      veteranStatus: saved.veteranStatus || "",
      citizenship: saved.citizenship || "",
      lastKnownCountry: saved.lastKnownCountry || "",
      lastKnownStreet: saved.lastKnownStreet || "",
      lastKnownCity: saved.lastKnownCity || "",
      lastKnownState: saved.lastKnownState || "",
      lastKnownCounty: saved.lastKnownCounty || "",
      lastKnownZip: saved.lastKnownZip || "",
      deathLocationType: saved.deathLocationType || "",
      deathFacilityName: saved.deathFacilityName || "",
      deathCountry: saved.deathCountry || "",
      deathStreet: saved.deathStreet || "",
      deathCity: saved.deathCity || "",
      deathState: saved.deathState || "",
      deathCounty: saved.deathCounty || "",
      deathZip: saved.deathZip || "",
      birthLocationType: saved.birthLocationType || "",
      birthFacilityName: saved.birthFacilityName || "",
      birthCountry: saved.birthCountry || "",
      birthStreet: saved.birthStreet || "",
      birthCity: saved.birthCity || "",
      birthState: saved.birthState || "",
      birthCounty: saved.birthCounty || "",
      birthZip: saved.birthZip || "",
      authorityType: saved.authorityType || "",
      customerStatus: saved.customerStatus || "",
      clickupId: saved.clickupId || "",
      mtcDate: saved.mtcDate || "",
      hasTrust: saved.hasTrust || false,
      hasWill: saved.hasWill || false,
      testAccount: saved.testAccount || false,
      authorityStatuses: saved.authorityStatuses || [],
      completeDate: saved.completeDate || "",
      churnedDate: saved.churnedDate || "",
      churnedReason: saved.churnedReason || "",
      churnedReasonNotes: saved.churnedReasonNotes || "",
    })
    setShowEditEstatePage(true)
  }

  const handleSaveEstate = () => {
    if (!selectedEstate) return
    setEstateData(prev => ({ ...prev, [selectedEstate.id]: editForm }))
    setShowEditEstatePage(false)
  }

  // Deadline urgency helper
  const getDeadlineUrgency = (dueDate: string, completed: boolean) => {
    if (completed) return { label: "Completed", color: "bg-green-100 text-green-700" }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0)  return { label: `${Math.abs(diffDays)}d overdue`, color: "bg-red-100 text-red-700" }
    if (diffDays <= 3) return { label: `${diffDays}d left`, color: "bg-orange-100 text-orange-700" }
    if (diffDays <= 7) return { label: `${diffDays}d left`, color: "bg-amber-100 text-amber-700" }
    if (diffDays <= 30) return { label: `${diffDays}d left`, color: "bg-blue-100 text-blue-700" }
    return { label: `${diffDays}d left`, color: "bg-[#ebe9e6] text-[#6b675f]" }
  }

  const resetDeadlineModal = () => {
    setShowAddDeadlineModal(false)
    setDeadlineModalStep(1)
    setDeadlineModalTrigger(null)
    setDeadlineModalChecked([])
    setDeadlineModalWindowOverrides({})
    setNewDeadlineTitle("")
    setNewDeadlineDueDate("")
    setNewDeadlineDescription("")
    setNewDeadlineTrigger("")
    setNewDeadlineWindow("")
    setNewKeyDateTitle("")
    setNewKeyDateDate("")
    setNewKeyDateNotes("")
  }

  // Calculate due date from a milestone date string (e.g. "Mar 1, 2025") and a window string
  const calcDueDate = (milestoneDate: string, window: string): string => {
    try {
      let base: Date
      // Try parsing "MMM d, yyyy" first, then ISO
      try { base = new Date(milestoneDate) } catch { return "" }
      if (isNaN(base.getTime())) return ""
      const lower = window.toLowerCase()
      const numMatch = lower.match(/(\d+)/)
      const num = numMatch ? parseInt(numMatch[1]) : 0
      if (lower.includes("month")) {
        const d = new Date(base)
        d.setMonth(d.getMonth() + num)
        return format(d, "yyyy-MM-dd")
      }
      if (lower.includes("day")) {
        const d = new Date(base)
        d.setDate(d.getDate() + num)
        return format(d, "yyyy-MM-dd")
      }
      return ""
    } catch { return "" }
  }

  // Look up a milestone date from the milestones list by name keyword
  const getMilestoneDate = (keyword: string): string => {
    const m = milestones.find(m => m.name.toLowerCase().includes(keyword.toLowerCase()))
    return m?.date ?? ""
  }

  const handleAddDeadline = () => {
    if (deadlineModalTrigger === "custom") {
      if (!newDeadlineTitle || !newDeadlineDueDate) {
        alert("Please fill in at least the title and due date.")
        return
      }
      setDeadlines(prev => [...prev, {
        id: Date.now(),
        title: newDeadlineTitle,
        trigger: newDeadlineTrigger || "Custom",
        window: newDeadlineWindow || "",
        dueDate: newDeadlineDueDate,
        description: newDeadlineDescription || "",
        completed: false,
        completedAt: undefined
      }])
      resetDeadlineModal()
      return
    }

    const category = DEADLINE_CATEGORIES.find(c => c.key === deadlineModalTrigger)
    if (!category) return

    const milestoneDate = getMilestoneDate(category.triggerKeyword)

    const toAdd = category.items
      .filter(item => deadlineModalChecked.includes(item.title))
      .map((item) => {
        const overriddenValue = deadlineModalWindowOverrides[item.title] ?? item.defaultValue
        const windowStr = `${overriddenValue} ${item.unit}`
        return {
          id: Date.now() + Math.random(),
          title: item.title,
          trigger: category.triggerLabel,
          window: windowStr,
          dueDate: milestoneDate ? calcDueDate(milestoneDate, windowStr) : "",
          description: item.description,
          completed: false,
          completedAt: undefined as string | undefined
        }
      })

    if (toAdd.length === 0) return
    setDeadlines(prev => [...prev, ...toAdd])
    resetDeadlineModal()
  }

  const handleToggleDeadlineComplete = (id: number) => {
    setDeadlines(deadlines.map(d =>
      d.id === id
        ? { ...d, completed: !d.completed, completedAt: !d.completed ? new Date().toISOString() : undefined }
        : d
    ))
  }

  const handleAddKeyDate = () => {
    if (!newKeyDateTitle || !newKeyDateDate) return
    setKeyDates(prev => [...prev, {
      id: Date.now(),
      title: newKeyDateTitle,
      date: newKeyDateDate,
      notes: newKeyDateNotes || ""
    }])
    resetDeadlineModal()
  }

  // Document folder structure
  const documentFolders = {
    root: [
      { name: "Executor Documents", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Beneficiary Documents", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Partner Documents", modified: "Mon Nov 4 2024 by Alix" }
    ],
    "Executor Documents": [
      { name: "Accounts", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Cherished Memories", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Debts & Obligations", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Estate Settlements Docs", modified: "Wed Nov 6 2024 by Jolene Smith" },
      { name: "Fraud Notifications", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Miscellaneous", modified: "Mon Nov 4 2024 by Alix" },
      { name: "My Uploads", modified: "Thu May 29 2025 by MeetAlix" },
      { name: "Probate", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Real Estate", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Tax Documents", modified: "Mon Nov 4 2024 by Alix" },
      { name: "Vehicles", modified: "Mon Nov 4 2024 by Alix" }
    ],
    "Beneficiary Documents": [],
    "Partner Documents": []
  }

  // Edit Estate Page
  if (selectedEstate && showEditEstatePage) {
    const iField = "w-full h-9 px-3 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]"
    const iLabel = "block text-xs font-medium text-[#6b675f] mb-1"
    const subHead = (title: string) => (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#3d3d3d] font-bold">—</span>
        <span className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide">{title}</span>
      </div>
    )
    const Toggle = ({ val, onChange }: { val: boolean, onChange: () => void }) => (
      <button role="switch" aria-checked={val} onClick={onChange}
        className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3d3d3d] focus:ring-offset-1 ${val ? 'bg-[#3d3d3d]' : 'bg-[#d0d0d0]'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${val ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </button>
    )
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#f5f4f2]">
        {/* Nav header */}
        <header className="bg-[#3d3d3d] text-white px-6 py-3 flex items-center gap-3 border-b border-[#2a2a2a] flex-shrink-0">
          <button
            onClick={() => setShowEditEstatePage(false)}
            className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to estate</span>
          </button>
          <span className="text-[#555]">·</span>
          <span className="text-sm font-semibold">Edit Estate</span>
        </header>

        {/* Sticky estate summary */}
        <div className="flex-shrink-0 bg-white border-b border-[#e5e5e5] px-6 py-3 z-10">
          <div className="text-xs text-[#6b675f] mb-0.5">
            Estate ID: <span className="font-mono">{selectedEstate.id}</span>
            {selectedEstate.scanBoxId && <> &nbsp;·&nbsp; Scan Box: <span className="font-mono">{selectedEstate.scanBoxId}</span></>}
          </div>
          <div className="font-semibold text-[#3d3d3d]">Estate of: {selectedEstate.name}</div>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto py-6 px-6 space-y-5">

            {/* ── Section 1: Deceased Biological Info ── */}
            <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
              <div className="border-l-4 border-[#3d3d3d] px-5 py-3 bg-[#fafafa] border-b border-[#e5e5e5]">
                <h3 className="text-[11px] font-bold text-[#3d3d3d] uppercase tracking-widest">Deceased Biological Info</h3>
              </div>
              <div className="px-5 py-5 space-y-6">

                {/* Name from Death Certificate */}
                <div>
                  {subHead("Name from Death Certificate")}
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className={iLabel}>First Name</label>
                      <input value={editForm.firstName || ""} onChange={e => setEditForm((p: any) => ({ ...p, firstName: e.target.value }))} placeholder="First name" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>Middle Name</label>
                      <input value={editForm.middleName || ""} onChange={e => setEditForm((p: any) => ({ ...p, middleName: e.target.value }))} placeholder="Middle name" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>Last Name</label>
                      <input value={editForm.lastName || ""} onChange={e => setEditForm((p: any) => ({ ...p, lastName: e.target.value }))} placeholder="Last name" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>Suffix</label>
                      <input value={editForm.suffix || ""} onChange={e => setEditForm((p: any) => ({ ...p, suffix: e.target.value }))} placeholder="Jr., Sr., III…" className={iField} />
                    </div>
                  </div>
                </div>

                {/* Identification */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#3d3d3d] font-bold">—</span>
                      <span className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide">Identification</span>
                    </div>
                    <button onClick={() => setEditForm((p: any) => ({ ...p, identifications: [...(p.identifications || []), { type: "", number: "" }] }))}
                      className="flex items-center gap-1 text-xs text-[#3d3d3d] border border-[#d0d0d0] rounded px-2 py-1 hover:bg-[#f8f7f5]">
                      <Plus className="w-3 h-3" /> Add Identification
                    </button>
                  </div>
                  {(editForm.identifications || []).length === 0 && <p className="text-xs text-[#9b9b9b]">No identifications added.</p>}
                  <div className="space-y-2">
                    {(editForm.identifications || []).map((id: any, i: number) => (
                      <div key={i} className="flex gap-3 items-end bg-[#fafafa] border border-[#ebebeb] rounded-lg p-3">
                        <div className="flex-1">
                          <label className={iLabel}>Type</label>
                          <select value={id.type} onChange={e => setEditForm((p: any) => ({ ...p, identifications: p.identifications.map((item: any, idx: number) => idx === i ? { ...item, type: e.target.value } : item) }))} className={iField}>
                            <option value="">Select type…</option>
                            <option value="Driver's License">Driver's License</option>
                            <option value="State ID">State ID</option>
                            <option value="Passport">Passport</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className={iLabel}>Number</label>
                          <input value={id.number} onChange={e => setEditForm((p: any) => ({ ...p, identifications: p.identifications.map((item: any, idx: number) => idx === i ? { ...item, number: e.target.value } : item) }))} placeholder="ID number" className={iField} />
                        </div>
                        <button onClick={() => setEditForm((p: any) => ({ ...p, identifications: p.identifications.filter((_: any, idx: number) => idx !== i) }))} className="h-9 w-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded flex-shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Biological Details */}
                <div>
                  {subHead("Biological Details")}
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className={iLabel}>Gender</label>
                      <select value={editForm.gender || ""} onChange={e => setEditForm((p: any) => ({ ...p, gender: e.target.value }))} className={iField}>
                        <option value="">Select…</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className={iLabel}>Date of Birth</label>
                      <input type="date" value={editForm.dateOfBirth || ""} onChange={e => setEditForm((p: any) => ({ ...p, dateOfBirth: e.target.value }))} className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>Date of Death</label>
                      <input type="date" value={editForm.dateOfDeath || ""} onChange={e => setEditForm((p: any) => ({ ...p, dateOfDeath: e.target.value }))} className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>SSN</label>
                      <input value={editForm.ssn || ""} onChange={e => setEditForm((p: any) => ({ ...p, ssn: e.target.value }))} placeholder="XXX-XX-XXXX" className={iField} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className={iLabel}>Marital Status</label>
                      <select value={editForm.maritalStatus || ""} onChange={e => setEditForm((p: any) => ({ ...p, maritalStatus: e.target.value }))} className={iField}>
                        <option value="">Select…</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className={iLabel}>Citizenship</label>
                        <input value={editForm.citizenship || ""} onChange={e => setEditForm((p: any) => ({ ...p, citizenship: e.target.value }))} placeholder="e.g. US Citizen" className={iField} />
                      </div>
                    </div>
                    <div className="flex items-end pb-2">
                      <div className="flex items-center gap-3">
                        <Toggle val={editForm.veteranStatus === "Veteran"} onChange={() => setEditForm((p: any) => ({ ...p, veteranStatus: p.veteranStatus === "Veteran" ? "" : "Veteran" }))} />
                        <span className="text-sm text-[#3d3d3d]">Veteran Status?</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aliases */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#3d3d3d] font-bold">—</span>
                      <span className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide">List of Aliases</span>
                    </div>
                    <button onClick={() => setEditForm((p: any) => ({ ...p, aliases: [...(p.aliases || []), { firstName: "", middleName: "", lastName: "", suffix: "", birthCertInfo: "" }] }))}
                      className="flex items-center gap-1 text-xs text-[#3d3d3d] border border-[#d0d0d0] rounded px-2 py-1 hover:bg-[#f8f7f5]">
                      <Plus className="w-3 h-3" /> Add Alias
                    </button>
                  </div>
                  {(editForm.aliases || []).length === 0 && <p className="text-xs text-[#9b9b9b]">No aliases added.</p>}
                  <div className="space-y-3">
                    {(editForm.aliases || []).map((alias: any, i: number) => (
                      <div key={i} className="bg-[#fafafa] border border-[#ebebeb] rounded-lg p-3">
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          <div><label className={iLabel}>First</label><input value={alias.firstName} onChange={e => setEditForm((p: any) => ({ ...p, aliases: p.aliases.map((a: any, idx: number) => idx === i ? { ...a, firstName: e.target.value } : a) }))} placeholder="First" className="w-full h-8 px-2 text-xs bg-white border border-[#d0d0d0] rounded text-[#3d3d3d] focus:outline-none focus:ring-1 focus:ring-[#3d3d3d]" /></div>
                          <div><label className={iLabel}>Middle</label><input value={alias.middleName} onChange={e => setEditForm((p: any) => ({ ...p, aliases: p.aliases.map((a: any, idx: number) => idx === i ? { ...a, middleName: e.target.value } : a) }))} placeholder="Middle" className="w-full h-8 px-2 text-xs bg-white border border-[#d0d0d0] rounded text-[#3d3d3d] focus:outline-none focus:ring-1 focus:ring-[#3d3d3d]" /></div>
                          <div><label className={iLabel}>Last</label><input value={alias.lastName} onChange={e => setEditForm((p: any) => ({ ...p, aliases: p.aliases.map((a: any, idx: number) => idx === i ? { ...a, lastName: e.target.value } : a) }))} placeholder="Last" className="w-full h-8 px-2 text-xs bg-white border border-[#d0d0d0] rounded text-[#3d3d3d] focus:outline-none focus:ring-1 focus:ring-[#3d3d3d]" /></div>
                          <div><label className={iLabel}>Suffix</label><input value={alias.suffix} onChange={e => setEditForm((p: any) => ({ ...p, aliases: p.aliases.map((a: any, idx: number) => idx === i ? { ...a, suffix: e.target.value } : a) }))} placeholder="Suffix" className="w-full h-8 px-2 text-xs bg-white border border-[#d0d0d0] rounded text-[#3d3d3d] focus:outline-none focus:ring-1 focus:ring-[#3d3d3d]" /></div>
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1"><label className={iLabel}>Birth Certificate Info</label><input value={alias.birthCertInfo} onChange={e => setEditForm((p: any) => ({ ...p, aliases: p.aliases.map((a: any, idx: number) => idx === i ? { ...a, birthCertInfo: e.target.value } : a) }))} placeholder="Certificate notes" className="w-full h-8 px-2 text-xs bg-white border border-[#d0d0d0] rounded text-[#3d3d3d] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-1 focus:ring-[#3d3d3d]" /></div>
                          <button onClick={() => setEditForm((p: any) => ({ ...p, aliases: p.aliases.filter((_: any, idx: number) => idx !== i) }))} className="h-8 w-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* ── Section 2: Location Info ── */}
            <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
              <div className="border-l-4 border-[#3d3d3d] px-5 py-3 bg-[#fafafa] border-b border-[#e5e5e5]">
                <h3 className="text-[11px] font-bold text-[#3d3d3d] uppercase tracking-widest">Location Info</h3>
              </div>
              <div className="px-5 py-5 space-y-6">

                {/* Last Known Address */}
                <div>
                  {subHead("Last Known Address")}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={iLabel}>Country</label>
                      <input value={editForm.lastKnownCountry || ""} onChange={e => setEditForm((p: any) => ({ ...p, lastKnownCountry: e.target.value }))} placeholder="United States" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>Street Address</label>
                      <input value={editForm.lastKnownStreet || ""} onChange={e => setEditForm((p: any) => ({ ...p, lastKnownStreet: e.target.value }))} placeholder="123 Main St" className={iField} />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className={iLabel}>City</label>
                      <input value={editForm.lastKnownCity || ""} onChange={e => setEditForm((p: any) => ({ ...p, lastKnownCity: e.target.value }))} placeholder="City" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>State</label>
                      <input value={editForm.lastKnownState || ""} onChange={e => setEditForm((p: any) => ({ ...p, lastKnownState: e.target.value }))} placeholder="CA" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>County</label>
                      <input value={editForm.lastKnownCounty || ""} onChange={e => setEditForm((p: any) => ({ ...p, lastKnownCounty: e.target.value }))} placeholder="County" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>ZIP Code</label>
                      <input value={editForm.lastKnownZip || ""} onChange={e => setEditForm((p: any) => ({ ...p, lastKnownZip: e.target.value }))} placeholder="12345" className={iField} />
                    </div>
                  </div>
                </div>

                {/* Place of Death */}
                <div>
                  {subHead("Place of Death")}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={iLabel}>Location Type</label>
                      <select value={editForm.deathLocationType || ""} onChange={e => setEditForm((p: any) => ({ ...p, deathLocationType: e.target.value }))} className={iField}>
                        <option value="">Location Type</option>
                        <option value="Hospital">Hospital</option>
                        <option value="Home">Home</option>
                        <option value="Hospice">Hospice</option>
                        <option value="Nursing Home">Nursing Home</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={iLabel}>Facility Name</label>
                      <input value={editForm.deathFacilityName || ""} onChange={e => setEditForm((p: any) => ({ ...p, deathFacilityName: e.target.value }))} placeholder="Facility Name" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>Country</label>
                      <input value={editForm.deathCountry || ""} onChange={e => setEditForm((p: any) => ({ ...p, deathCountry: e.target.value }))} placeholder="Country" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>Street</label>
                      <input value={editForm.deathStreet || ""} onChange={e => setEditForm((p: any) => ({ ...p, deathStreet: e.target.value }))} placeholder="Street address" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>City</label>
                      <input value={editForm.deathCity || ""} onChange={e => setEditForm((p: any) => ({ ...p, deathCity: e.target.value }))} placeholder="City" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>State</label>
                      <input value={editForm.deathState || ""} onChange={e => setEditForm((p: any) => ({ ...p, deathState: e.target.value }))} placeholder="CA" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>County</label>
                      <input value={editForm.deathCounty || ""} onChange={e => setEditForm((p: any) => ({ ...p, deathCounty: e.target.value }))} placeholder="County" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>ZIP</label>
                      <input value={editForm.deathZip || ""} onChange={e => setEditForm((p: any) => ({ ...p, deathZip: e.target.value }))} placeholder="12345" className={iField} />
                    </div>
                  </div>
                </div>

                {/* Place of Birth */}
                <div>
                  {subHead("Place of Birth")}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={iLabel}>Location Type</label>
                      <select value={editForm.birthLocationType || ""} onChange={e => setEditForm((p: any) => ({ ...p, birthLocationType: e.target.value }))} className={iField}>
                        <option value="">Location Type</option>
                        <option value="Hospital">Hospital</option>
                        <option value="Home">Home</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={iLabel}>Facility Name</label>
                      <input value={editForm.birthFacilityName || ""} onChange={e => setEditForm((p: any) => ({ ...p, birthFacilityName: e.target.value }))} placeholder="Facility Name" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>Country</label>
                      <input value={editForm.birthCountry || ""} onChange={e => setEditForm((p: any) => ({ ...p, birthCountry: e.target.value }))} placeholder="Country" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>Street</label>
                      <input value={editForm.birthStreet || ""} onChange={e => setEditForm((p: any) => ({ ...p, birthStreet: e.target.value }))} placeholder="Street address" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>City</label>
                      <input value={editForm.birthCity || ""} onChange={e => setEditForm((p: any) => ({ ...p, birthCity: e.target.value }))} placeholder="City" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>State</label>
                      <input value={editForm.birthState || ""} onChange={e => setEditForm((p: any) => ({ ...p, birthState: e.target.value }))} placeholder="CA" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>County</label>
                      <input value={editForm.birthCounty || ""} onChange={e => setEditForm((p: any) => ({ ...p, birthCounty: e.target.value }))} placeholder="County" className={iField} />
                    </div>
                    <div>
                      <label className={iLabel}>ZIP</label>
                      <input value={editForm.birthZip || ""} onChange={e => setEditForm((p: any) => ({ ...p, birthZip: e.target.value }))} placeholder="12345" className={iField} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Section 3: Estate Info ── */}
            <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
              <div className="border-l-4 border-[#3d3d3d] px-5 py-3 bg-[#fafafa] border-b border-[#e5e5e5]">
                <h3 className="text-[11px] font-bold text-[#3d3d3d] uppercase tracking-widest">Estate Info</h3>
              </div>
              <div className="px-5 py-5 space-y-6">

              {/* Main Details */}
              <div>
                {subHead("Estate Details")}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className={iLabel}>Authority Type</label>
                    <select value={editForm.authorityType || ""} onChange={e => setEditForm((p: any) => ({ ...p, authorityType: e.target.value }))} className="w-full h-9 px-3 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]">
                      <option value="">Select…</option>
                      <option value="Trust">Trust</option>
                      <option value="Estate (SEA)">Estate (SEA)</option>
                      <option value="Estate (Probate)">Estate (Probate)</option>
                      <option value="Estate (Lawyer Required)">Estate (Lawyer Required)</option>
                      <option value="Trust & Estate">Trust &amp; Estate</option>
                    </select>
                  </div>
                  <div>
                    <label className={iLabel}>Customer Status</label>
                    <select value={editForm.customerStatus || ""} onChange={e => setEditForm((p: any) => ({ ...p, customerStatus: e.target.value }))} className={iField}>
                      <option value="">Select…</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Churned">Churned</option>
                    </select>
                  </div>
                  <div>
                    <label className={iLabel}>ClickUp ID</label>
                    <input value={editForm.clickupId || ""} onChange={e => setEditForm((p: any) => ({ ...p, clickupId: e.target.value }))} placeholder="ClickUp task ID" className={iField} />
                  </div>
                  <div>
                    <label className={iLabel}>MTC Date</label>
                    <input type="date" value={editForm.mtcDate || ""} onChange={e => setEditForm((p: any) => ({ ...p, mtcDate: e.target.value }))} className={iField} />
                  </div>
                </div>
                <div className="flex items-center gap-8 mt-4">
                  <div className="flex items-center gap-2.5">
                    <Toggle val={editForm.hasTrust || false} onChange={() => setEditForm((p: any) => ({ ...p, hasTrust: !p.hasTrust }))} />
                    <span className="text-sm text-[#3d3d3d]">Has Trust?</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Toggle val={editForm.hasWill || false} onChange={() => setEditForm((p: any) => ({ ...p, hasWill: !p.hasWill }))} />
                    <span className="text-sm text-[#3d3d3d]">Has Will?</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Toggle val={editForm.testAccount || false} onChange={() => setEditForm((p: any) => ({ ...p, testAccount: !p.testAccount }))} />
                    <span className="text-sm text-[#3d3d3d]">Test Account?</span>
                  </div>
                </div>
              </div>

              {/* Authority Statuses */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[#3d3d3d] font-bold">—</span>
                    <span className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide">Authority Statuses</span>
                  </div>
                  <button onClick={() => setEditForm((p: any) => ({ ...p, authorityStatuses: [...(p.authorityStatuses || []), { authorityStatus: "", einTaxId: "", obtainedAt: "", boxFileId: "" }] }))}
                    className="flex items-center gap-1 text-xs text-[#3d3d3d] border border-[#d0d0d0] rounded px-2 py-1 hover:bg-[#f8f7f5]">
                    <Plus className="w-3 h-3" /> Add Status
                  </button>
                </div>
                {(editForm.authorityStatuses || []).length === 0 && <p className="text-xs text-[#9b9b9b]">No authority statuses found for this estate.</p>}
                <div className="space-y-3">
                  {(editForm.authorityStatuses || []).map((as: any, i: number) => (
                    <div key={i} className="bg-[#fafafa] border border-[#ebebeb] rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block text-xs font-medium text-[#6b675f] mb-1">Authority Status</label>
                          <input value={as.authorityStatus} onChange={e => setEditForm((p: any) => ({ ...p, authorityStatuses: p.authorityStatuses.map((item: any, idx: number) => idx === i ? { ...item, authorityStatus: e.target.value } : item) }))} placeholder="Status" className="w-full h-8 px-2 text-xs bg-white border border-[#d0d0d0] rounded text-[#3d3d3d] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-1 focus:ring-[#3d3d3d]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#6b675f] mb-1">EIN / Tax ID</label>
                          <input value={as.einTaxId} onChange={e => setEditForm((p: any) => ({ ...p, authorityStatuses: p.authorityStatuses.map((item: any, idx: number) => idx === i ? { ...item, einTaxId: e.target.value } : item) }))} placeholder="XX-XXXXXXX" className="w-full h-8 px-2 text-xs bg-white border border-[#d0d0d0] rounded text-[#3d3d3d] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-1 focus:ring-[#3d3d3d]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#6b675f] mb-1">Obtained At</label>
                          <input type="date" value={as.obtainedAt} onChange={e => setEditForm((p: any) => ({ ...p, authorityStatuses: p.authorityStatuses.map((item: any, idx: number) => idx === i ? { ...item, obtainedAt: e.target.value } : item) }))} className="w-full h-8 px-2 text-xs bg-white border border-[#d0d0d0] rounded text-[#3d3d3d] focus:outline-none focus:ring-1 focus:ring-[#3d3d3d]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#6b675f] mb-1">Box File ID</label>
                          <input value={as.boxFileId} onChange={e => setEditForm((p: any) => ({ ...p, authorityStatuses: p.authorityStatuses.map((item: any, idx: number) => idx === i ? { ...item, boxFileId: e.target.value } : item) }))} placeholder="Box file ID" className="w-full h-8 px-2 text-xs bg-white border border-[#d0d0d0] rounded text-[#3d3d3d] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-1 focus:ring-[#3d3d3d]" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button onClick={() => setEditForm((p: any) => ({ ...p, authorityStatuses: p.authorityStatuses.filter((_: any, idx: number) => idx !== i) }))} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estate Closure — conditional on customer status */}
              {editForm.customerStatus === "Completed" && (
                <div>
                  <p className="text-sm font-medium text-[#3d3d3d] mb-3">Estate Closure</p>
                  <div className="max-w-xs">
                    <label className="block text-xs font-medium text-[#6b675f] mb-1">Complete Date</label>
                    <input type="date" value={editForm.completeDate || ""} onChange={e => setEditForm((p: any) => ({ ...p, completeDate: e.target.value }))} className="w-full h-9 px-3 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]" />
                  </div>
                </div>
              )}
              {editForm.customerStatus === "Churned" && (
                <div>
                  <p className="text-sm font-medium text-[#3d3d3d] mb-3">Estate Closure</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#6b675f] mb-1">Churned Date</label>
                      <input type="date" value={editForm.churnedDate || ""} onChange={e => setEditForm((p: any) => ({ ...p, churnedDate: e.target.value }))} className="w-full h-9 px-3 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6b675f] mb-1">Churned Reason</label>
                      <input value={editForm.churnedReason || ""} onChange={e => setEditForm((p: any) => ({ ...p, churnedReason: e.target.value }))} placeholder="Reason for churning" className="w-full h-9 px-3 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-[#6b675f] mb-1">Churned Reason Notes</label>
                      <textarea value={editForm.churnedReasonNotes || ""} onChange={e => setEditForm((p: any) => ({ ...p, churnedReasonNotes: e.target.value }))} placeholder="Additional notes…" rows={3} className="w-full px-3 py-2 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d] resize-none" />
                    </div>
                  </div>
                </div>
              )}

              </div>
            </div>

          </div>
        </div>

        {/* Sticky footer */}
        <div className="flex-shrink-0 bg-white border-t border-[#e5e5e5] px-6 py-4 flex items-center justify-end gap-3">
          <button onClick={() => setShowEditEstatePage(false)} className="px-4 py-2 text-sm text-[#6b675f] border border-[#d0d0d0] rounded-md hover:bg-[#f8f7f5] transition-colors">
            Cancel
          </button>
          <Button onClick={handleSaveEstate} className="bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-sm px-5">
            Save
          </Button>
        </div>
      </div>
    )
  }


  // Estate Detail View
  if (selectedEstate) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-white">
        {/* Dark Header Bar */}
        <header className="bg-[#3d3d3d] text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-1 hover:bg-[#4d4d4d] rounded transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-base font-semibold truncate">Estate of {selectedEstate.name}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs text-gray-400 hidden sm:inline">release/2025-12-30#2 | 44fecdd</span>
            <button className="p-1 hover:bg-[#4d4d4d] rounded transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="p-1 hover:bg-[#4d4d4d] rounded transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Estate Detail Sidebar */}
          <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-30 w-64 bg-[#d8d4ce] flex flex-col border-r border-[#c0bcb6] transition-transform duration-300 h-full`}>
            <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
              <button
                onClick={() => { setSelectedEstate(null); setActiveNav("home"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]`}
                title="Home"
              >
                <Home className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Home</span>
              </button>
              <button
                onClick={() => { setActiveNav("legal"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${activeNav === "legal" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"}`}
                title="Legal"
              >
                <FileCheck className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Legal</span>
                <span className="ml-auto text-[9px] font-semibold text-amber-600 bg-amber-100 border border-amber-200 rounded px-1 py-0.5 leading-tight">PROTO</span>
              </button>
              <button
                onClick={() => { setActiveNav("jobs-board"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "jobs-board" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Jobs Board"
              >
                <Briefcase className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Jobs Board</span>
              </button>
              <button
                onClick={() => { setActiveNav("documents"); setCurrentFolder(null); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "documents" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Documents"
              >
                <Folder className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Documents</span>
              </button>
              <button
                onClick={() => { setActiveNav("timeline"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "timeline" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Estate Timeline"
              >
                <CalendarDays className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Estate Timeline</span>
              </button>
              <button
                onClick={() => { setActiveNav("assets"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "assets" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Assets"
              >
                <Building2 className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Assets</span>
              </button>
              <button
                onClick={() => { setActiveNav("debts"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "debts" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Debts"
              >
                <CreditCard className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Debts</span>
              </button>
              <button
                onClick={() => { setActiveNav("expenses"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "expenses" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Expenses"
              >
                <DollarSign className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Expenses</span>
              </button>
              <button
                onClick={() => { setActiveNav("obligations"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "obligations" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Obligations"
              >
                <Lock className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Obligations</span>
              </button>
              <button
                onClick={() => { setActiveNav("other-components"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "other-components" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Other Components"
              >
                <Clipboard className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Other Components</span>
              </button>
              <button
                onClick={() => { setActiveNav("contacts"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "contacts" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Contacts"
              >
                <UserCircle className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Contacts</span>
              </button>
              <button
                onClick={() => { setActiveNav("operating-bank"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "operating-bank" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Operating Bank Accounts"
              >
                <BarChart3 className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Operating Bank Accounts</span>
              </button>
              <button
                onClick={() => { setActiveNav("flexible-spending"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "flexible-spending" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Flexible Spending Accounts"
              >
                <CircleDollarSign className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Flexible Spending Accounts</span>
              </button>
              <button
                onClick={() => { setActiveNav("action-cards"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "action-cards" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Action Cards"
              >
                <FileCheck className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Action Cards</span>
              </button>
              <button
                onClick={() => { setActiveNav("care-team-notes"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "care-team-notes" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Care Team Notes"
              >
                <FileText className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Care Team Notes</span>
              </button>
              <button
                onClick={() => { setActiveNav("discovery-agent"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "discovery-agent" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Discovery Agent"
              >
                <Search className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Discovery Agent</span>
              </button>
              <button
                onClick={() => { setActiveNav("content-cards"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "content-cards" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Content Cards"
              >
                <FolderOpen className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Content Cards</span>
              </button>
              <button
                onClick={() => { setActiveNav("assign-team"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "assign-team" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Assign Team Member"
              >
                <UserPlus className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Assign Team Member</span>
              </button>
              <button
                onClick={() => { setActiveNav("fee-manager"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "fee-manager" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Fee Manager"
              >
                <CircleDollarSign className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Fee Manager</span>
              </button>
              <button
                onClick={() => { setActiveNav("clickup"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "clickup" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="ClickUp"
              >
                <MousePointer className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">ClickUp</span>
              </button>
              <button
                onClick={() => { setActiveNav("manage-users-estate"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                  activeNav === "manage-users-estate" ? "bg-[#ececec] text-[#3d3d3d]" : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                }`}
                title="Manage Users on Estate"
              >
                <Users className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Manage Users on Estate</span>
              </button>
              <hr className="border-[#c0bcb6] my-1.5 mx-2" />
              <a
                href="/probate-research"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
                title="Probate Research"
              >
                <Map className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] whitespace-nowrap">Probate Research</span>
                <span className="ml-auto text-[9px] font-semibold text-[#7c6fc4] bg-purple-50 border border-purple-200 rounded px-1 py-0.5 leading-tight">NEW</span>
              </a>
            </nav>
          </aside>

          {/* Estate Detail Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden bg-[#f8f7f5]">
            {activeNav === "documents" ? (
              // Documents View
              <>
                {/* Documents Header */}
                <div className="bg-white border-b border-[#d4cfca] px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-2 mb-4">
                    {currentFolder && (
                      <>
                        <button
                          onClick={() => setCurrentFolder(null)}
                          className="text-[#8b7d6f] hover:text-[#2d2d2d] text-sm"
                        >
                          Documents
                        </button>
                        <ChevronRight className="w-4 h-4 text-[#8b7d6f]" />
                      </>
                    )}
                    <h2 className="text-base sm:text-lg font-semibold text-[#2d2d2d] truncate">
                      {currentFolder || "Documents"}
                    </h2>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <div className="relative flex-1 w-full">
                      <Input
                        type="text"
                        placeholder="Search files and folders"
                        className="w-full h-9 text-sm bg-white border-[#d0d0d0] text-[#3d3d3d] placeholder:text-[#9b9b9b]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-[#f8f7f5] rounded transition-colors" title="Grid view">
                        <Grid className="w-5 h-5 text-[#6b675f]" />
                      </button>
                      <Button 
                        onClick={() => setShowUploadModal(true)}
                        className="bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-sm h-9 flex-1 sm:flex-initial"
                      >
                        <Upload className="w-4 h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">Upload</span>
                      </Button>
                      <Button className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] text-sm h-9 flex-1 sm:flex-initial">
                        <Plus className="w-4 h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">New Folder</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Upload Modal */}
                {showUploadModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                      {/* Modal Header */}
                      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#e5e5e5]">
                        <div>
                          <h2 className="text-lg font-semibold text-[#3d3d3d]">Upload Documents</h2>
                          <p className="text-xs text-[#6b675f] mt-1">
                            Upload to: {currentFolder || "Documents"}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setShowUploadModal(false)
                            setUploadedFiles([])
                          }}
                          className="p-2 hover:bg-[#f8f7f5] rounded-full transition-colors"
                        >
                          <X className="w-5 h-5 text-[#6b675f]" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
                        {/* Drag and Drop Area */}
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            isDragging
                              ? 'border-[#3d3d3d] bg-[#f8f7f5]'
                              : 'border-[#d0d0d0] hover:border-[#6b675f]'
                          }`}
                        >
                          <Upload className="w-12 h-12 text-[#d0d0d0] mx-auto mb-4" />
                          <p className="text-sm font-medium text-[#3d3d3d] mb-2">
                            Drag and drop files here
                          </p>
                          <p className="text-xs text-[#6b675f] mb-4">or</p>
                          <label className="inline-block">
                            <input
                              type="file"
                              multiple
                              onChange={handleFileSelect}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx"
                            />
                            <span className="px-4 py-2 bg-white border border-[#d0d0d0] text-[#3d3d3d] text-sm rounded-md hover:bg-[#f8f7f5] cursor-pointer inline-flex items-center gap-2 transition-colors">
                              <File className="w-4 h-4" />
                              Browse Files
                            </span>
                          </label>
                          <p className="text-xs text-[#6b675f] mt-4">
                            Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, TXT, XLS, XLSX
                          </p>
                          <p className="text-xs text-[#6b675f] mt-2 italic">
                            Tip: For multi-page documents, select all pages at once or use "Add Files" below to add pages individually
                          </p>
                        </div>

                        {/* Uploaded Files List */}
                        {uploadedFiles.length > 0 && (
                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-semibold text-[#3d3d3d]">
                                Selected Files ({uploadedFiles.length})
                              </h3>
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  multiple
                                  onChange={handleFileSelect}
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx"
                                />
                                <span className="px-3 py-1.5 bg-white border border-[#d0d0d0] text-[#3d3d3d] text-xs rounded hover:bg-[#f8f7f5] inline-flex items-center gap-1.5 transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                  Add Files
                                </span>
                              </label>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {uploadedFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-[#f8f7f5] rounded-lg border border-[#e5e5e5] group hover:border-[#d0d0d0] transition-colors"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <File className="w-5 h-5 text-[#6b675f] flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-[#3d3d3d] truncate">
                                        {file.name}
                                      </p>
                                      <p className="text-xs text-[#6b675f]">
                                        {formatFileSize(file.size)}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveFile(index)}
                                    className="p-1.5 text-[#6b675f] hover:bg-white hover:text-red-600 rounded transition-colors flex-shrink-0"
                                    title="Remove file"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Modal Footer */}
                      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between px-4 sm:px-6 py-4 border-t border-[#e5e5e5] bg-[#fafafa] gap-3">
                        <p className="text-xs text-[#6b675f] text-center sm:text-left">
                          {uploadedFiles.length > 0
                            ? `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} ready to upload`
                            : 'No files selected'}
                        </p>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => {
                              setShowUploadModal(false)
                              setUploadedFiles([])
                            }}
                            className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] text-sm h-9 flex-1 sm:flex-initial"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUploadComplete}
                            disabled={uploadedFiles.length === 0}
                            className="bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-sm h-9 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial"
                          >
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Move File Modal */}
                {showMoveModal && fileToMove && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
                      {/* Modal Header */}
                      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5]">
                        <h2 className="text-lg font-semibold text-[#3d3d3d]">Move File</h2>
                        <button
                          onClick={() => {
                            setShowMoveModal(false)
                            setFileToMove(null)
                          }}
                          className="p-2 hover:bg-[#f8f7f5] rounded-full transition-colors"
                        >
                          <X className="w-5 h-5 text-[#6b675f]" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="px-6 py-6">
                        <p className="text-sm text-[#6b675f] mb-4">
                          Move <span className="font-medium text-[#3d3d3d]">{fileToMove}</span> to:
                        </p>
                        
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {/* Show all folders except current one */}
                          {Object.keys(folders)
                            .filter(key => key !== "root" && key !== currentFolder)
                            .map((folderKey) => {
                              const folderList = folders[folderKey as keyof typeof folders];
                              if (Array.isArray(folderList) && folderList.length > 0) {
                                return folderList.map((folder) => (
                                  <button
                                    key={folder.name}
                                    onClick={() => handleMoveFile(fileToMove, folder.name)}
                                    className="w-full flex items-center gap-3 p-3 border border-[#e5e5e5] rounded-lg hover:border-[#3d3d3d] hover:bg-[#fafafa] transition-colors text-left"
                                  >
                                    <Folder className="w-5 h-5 text-[#6b675f] flex-shrink-0" />
                                    <span className="text-sm text-[#3d3d3d]">{folder.name}</span>
                                  </button>
                                ));
                              }
                              return null;
                            })}
                          
                          {/* Show root level folders */}
                          {folders.root.filter(f => f.name !== currentFolder).map((folder) => (
                            <button
                              key={folder.name}
                              onClick={() => handleMoveFile(fileToMove, folder.name)}
                              className="w-full flex items-center gap-3 p-3 border border-[#e5e5e5] rounded-lg hover:border-[#3d3d3d] hover:bg-[#fafafa] transition-colors text-left"
                            >
                              <Folder className="w-5 h-5 text-[#6b675f] flex-shrink-0" />
                              <span className="text-sm text-[#3d3d3d]">{folder.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="flex items-center justify-end px-6 py-4 border-t border-[#e5e5e5] bg-[#fafafa]">
                        <Button
                          onClick={() => {
                            setShowMoveModal(false)
                            setFileToMove(null)
                          }}
                          className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] text-sm h-9"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview Modal */}
                {showPreviewModal && previewFile && (
                  <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn p-2 sm:p-4"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowPreviewModal(false)
                        setPreviewFile(null)
                      }
                    }}
                  >
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
                      {/* Modal Header */}
                      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#e5e5e5]">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          {getFileIcon(previewFile.type)}
                          <h2 className="text-sm sm:text-lg font-semibold text-[#3d3d3d] truncate">{previewFile.name}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadFile(previewFile.name)}
                            className="p-2 hover:bg-[#f8f7f5] rounded transition-colors"
                            title="Download"
                          >
                            <Download className="w-5 h-5 text-[#6b675f]" />
                          </button>
                          <button
                            onClick={() => {
                              setShowPreviewModal(false)
                              setPreviewFile(null)
                            }}
                            className="p-2 hover:bg-[#f8f7f5] rounded-full transition-colors"
                          >
                            <X className="w-5 h-5 text-[#6b675f]" />
                          </button>
                        </div>
                      </div>

                      {/* Modal Body */}
                      <div className="flex-1 overflow-hidden p-6 bg-[#fafafa]">
                        <div className="h-full flex items-center justify-center">
                          {previewFile.type.startsWith('image/') ? (
                            <div className="max-w-full max-h-full flex items-center justify-center">
                              <div className="bg-white p-4 rounded-lg shadow-lg">
                                <img
                                  src={`https://via.placeholder.com/800x600/e5e5e5/6b675f?text=${encodeURIComponent(previewFile.name)}`}
                                  alt={previewFile.name}
                                  className="max-w-full max-h-[70vh] object-contain rounded"
                                />
                              </div>
                            </div>
                          ) : previewFile.type === 'application/pdf' ? (
                            <div className="w-full h-full bg-white rounded-lg shadow-lg p-8 flex items-center justify-center">
                              <div className="text-center">
                                <FileText className="w-24 h-24 text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-[#3d3d3d] mb-2">PDF Document</h3>
                                <p className="text-sm text-[#6b675f] mb-4">{previewFile.name}</p>
                                <p className="text-xs text-[#6b675f] mb-6">
                                  PDF preview will be available when integrated with a document viewer
                                </p>
                                <Button
                                  onClick={() => handleDownloadFile(previewFile.name)}
                                  className="bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-sm h-9"
                                >
                                  <Download className="w-4 h-4 mr-1.5" />
                                  Download to View
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <File className="w-24 h-24 text-[#d0d0d0] mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-[#3d3d3d] mb-2">Preview Not Available</h3>
                              <p className="text-sm text-[#6b675f] mb-4">{previewFile.name}</p>
                              <Button
                                onClick={() => handleDownloadFile(previewFile.name)}
                                className="bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-sm h-9"
                              >
                                <Download className="w-4 h-4 mr-1.5" />
                                Download File
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e5e5] bg-white">
                        <p className="text-xs text-[#6b675f]">
                          Press ESC to close
                        </p>
                        <Button
                          onClick={() => {
                            setShowPreviewModal(false)
                            setPreviewFile(null)
                          }}
                          className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] text-sm h-9"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents List */}
                <div className="flex-1 overflow-auto">
                  {(() => {
                    const currentFolders = currentFolder 
                      ? folders[currentFolder as keyof typeof folders] || []
                      : folders.root;
                    
                    const currentFiles = currentFolder ? files[currentFolder] || [] : [];
                    
                    const isEmpty = currentFolders.length === 0 && currentFiles.length === 0;

                    if (isEmpty) {
                      // Empty State with Animation
                      return (
                        <div className="flex items-center justify-center h-full animate-fadeIn">
                          <div className="text-center max-w-md px-6 py-12">
                            <div className="mb-6 relative inline-block">
                              {/* Folder icon */}
                              <div className="relative">
                                <FolderOpen className="w-24 h-24 text-[#d0d0d0]" />
                                {/* Upload icon */}
                                <div className="absolute -top-2 -right-2">
                                  <div className="bg-white rounded-full p-2 shadow-lg">
                                    <Upload className="w-6 h-6 text-[#6b675f]" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-[#3d3d3d] mb-2">
                              {currentFolder ? `No documents in ${currentFolder}` : "No folders yet"}
                            </h3>
                            
                            <p className="text-[13px] text-[#6b675f] mb-6 leading-relaxed">
                              {currentFolder 
                                ? "This folder is empty. Start organizing your documents by uploading files or creating subfolders."
                                : "Create your first folder to start organizing estate documents."}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button 
                                onClick={() => setShowUploadModal(true)}
                                className="bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-sm h-10"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Documents
                              </Button>
                              <Button className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] text-sm h-10">
                                <FolderPlus className="w-4 h-4 mr-2" />
                                Create Subfolder
                              </Button>
                            </div>
                            
                            {/* Helpful tips */}
                            <div className="mt-8 pt-6 border-t border-[#e5e5e5]">
                              <p className="text-xs text-[#6b675f] mb-3 font-medium">Quick Tips:</p>
                              <ul className="text-xs text-[#6b675f] space-y-2 text-left">
                                <li className="flex items-start gap-2">
                                  <span className="text-[#3d3d3d] mt-0.5">•</span>
                                  <span>Organize documents by type for easy access</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#3d3d3d] mt-0.5">•</span>
                                  <span>Use clear, descriptive names for folders</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#3d3d3d] mt-0.5">•</span>
                                  <span>Accepted formats: PDF, DOC, DOCX, JPG, PNG</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Regular folder/file list
                    return (
                      <div className="bg-white m-4 sm:m-6 rounded-lg border border-[#e5e5e5] overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                          <thead className="bg-[#f8f7f5] border-b border-[#e5e5e5]">
                            <tr>
                              <th className="text-left px-6 py-3 text-[#3d3d3d] font-semibold text-sm">Name</th>
                              <th className="text-left px-6 py-3 text-[#3d3d3d] font-semibold text-sm">Size</th>
                              <th className="text-left px-6 py-3 text-[#3d3d3d] font-semibold text-sm">Modified</th>
                              <th className="text-right px-6 py-3 text-[#3d3d3d] font-semibold text-sm w-48">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Folders */}
                            {currentFolders.map((folder, index) => (
                              <tr 
                                key={`folder-${index}`} 
                                className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors group"
                                onMouseEnter={() => setHoveredFolder(folder.name)}
                                onMouseLeave={() => setHoveredFolder(null)}
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <Folder className="w-5 h-5 text-[#6b675f] flex-shrink-0" />
                                    {editingFolder === folder.name ? (
                                      <input
                                        type="text"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        onBlur={() => handleRenameFolder(folder.name, editingValue)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleRenameFolder(folder.name, editingValue)
                                          } else if (e.key === 'Escape') {
                                            setEditingFolder(null)
                                          }
                                        }}
                                        autoFocus
                                        className="flex-1 px-2 py-1 text-sm border border-[#3d3d3d] rounded focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]"
                                      />
                                    ) : (
                                      <span 
                                        className="text-[#3d3d3d] text-sm cursor-pointer font-medium"
                                        onClick={() => {
                                          setCurrentFolder(folder.name);
                                        }}
                                      >
                                        {folder.name}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-[#6b675f] text-sm">—</td>
                                <td className="px-6 py-4 text-[#6b675f] text-sm">{folder.modified}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-end gap-1">
                                    {deleteConfirm === folder.name ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-[#6b675f]">Delete?</span>
                                        <button
                                          onClick={() => handleDeleteFolder(folder.name)}
                                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                        >
                                          Yes
                                        </button>
                                        <button
                                          onClick={() => setDeleteConfirm(null)}
                                          className="px-2 py-1 bg-[#e5e5e5] text-[#3d3d3d] text-xs rounded hover:bg-[#d0d0d0] transition-colors"
                                        >
                                          No
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingFolder(folder.name)
                                            setEditingValue(folder.name)
                                          }}
                                          className="p-1.5 text-[#6b675f] hover:bg-[#e5e5e5] rounded transition-colors"
                                          title="Rename folder"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setDeleteConfirm(folder.name)}
                                          className="p-1.5 text-[#6b675f] hover:bg-[#fee] hover:text-red-600 rounded transition-colors"
                                          title="Delete folder"
                                        >
                                          <Trash className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                            
                            {/* Files */}
                            {currentFiles.map((file, index) => (
                              <tr 
                                key={`file-${index}`} 
                                className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors group"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {getFileIcon(file.type)}
                                    {editingFile === file.name ? (
                                      <input
                                        type="text"
                                        value={editingFileValue}
                                        onChange={(e) => setEditingFileValue(e.target.value)}
                                        onBlur={() => handleRenameFile(file.name, editingFileValue)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleRenameFile(file.name, editingFileValue)
                                          } else if (e.key === 'Escape') {
                                            setEditingFile(null)
                                          }
                                        }}
                                        autoFocus
                                        className="flex-1 px-2 py-1 text-sm border border-[#3d3d3d] rounded focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]"
                                      />
                                    ) : (
                                      <span className="text-[#3d3d3d] text-sm">{file.name}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-[#6b675f] text-sm">{file.size}</td>
                                <td className="px-6 py-4 text-[#6b675f] text-sm">{file.modified}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-end gap-1">
                                    {deleteFileConfirm === file.name ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-[#6b675f]">Delete?</span>
                                        <button
                                          onClick={() => handleDeleteFile(file.name)}
                                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                        >
                                          Yes
                                        </button>
                                        <button
                                          onClick={() => setDeleteFileConfirm(null)}
                                          className="px-2 py-1 bg-[#e5e5e5] text-[#3d3d3d] text-xs rounded hover:bg-[#d0d0d0] transition-colors"
                                        >
                                          No
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => handlePreviewFile(file.name, file.type)}
                                          className="p-1.5 text-[#6b675f] hover:bg-[#e5e5e5] rounded transition-colors"
                                          title="Preview file"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDownloadFile(file.name)}
                                          className="p-1.5 text-[#6b675f] hover:bg-[#e5e5e5] rounded transition-colors"
                                          title="Download file"
                                        >
                                          <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingFile(file.name)
                                            setEditingFileValue(file.name)
                                          }}
                                          className="p-1.5 text-[#6b675f] hover:bg-[#e5e5e5] rounded transition-colors"
                                          title="Rename file"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            setFileToMove(file.name)
                                            setShowMoveModal(true)
                                          }}
                                          className="p-1.5 text-[#6b675f] hover:bg-[#e5e5e5] rounded transition-colors"
                                          title="Move to folder"
                                        >
                                          <FolderInput className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setDeleteFileConfirm(file.name)}
                                          className="p-1.5 text-[#6b675f] hover:bg-[#fee] hover:text-red-600 rounded transition-colors"
                                          title="Delete file"
                                        >
                                          <Trash className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : activeNav === "timeline" ? (
              // Estate Timeline View
              <>
                {/* Timeline Header */}
                <div className="bg-white border-b border-[#d4cfca] px-4 sm:px-6 py-4">
                  <h2 className="text-base sm:text-lg font-semibold text-[#2d2d2d] mb-4">Estate Timeline</h2>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <Button
                      onClick={() => setShowAddMilestoneModal(true)}
                      className="bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-sm h-9 flex-1 sm:flex-initial"
                    >
                      <Plus className="w-4 h-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">Add Milestone</span>
                    </Button>
                    <Button
                      onClick={() => { setShowAddDeadlineModal(true); setDeadlineModalStep(1); setDeadlineModalTrigger(null); setDeadlineModalChecked([]) }}
                      className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] text-sm h-9 flex-1 sm:flex-initial"
                    >
                      <Plus className="w-4 h-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">Add Deadline</span>
                    </Button>
                    <Button
                      onClick={() => { setShowAddDeadlineModal(true); setDeadlineModalStep(2); setDeadlineModalTrigger("key-date") }}
                      className="bg-[#f5f9ff] border border-[#c5d8f5] text-[#3d6baa] hover:bg-[#edf4ff] text-sm h-9 flex-1 sm:flex-initial"
                    >
                      <CalendarDays className="w-4 h-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">Add Key Date</span>
                    </Button>
                  </div>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-auto p-4 sm:p-6">
                  <div className="max-w-4xl mx-auto">

                    {/* Urgent Deadlines Callout — only shown when deadlines need attention */}
                    {(() => {
                      const urgent = deadlines.filter(d => {
                        if (d.completed) return false
                        const today = new Date(); today.setHours(0,0,0,0)
                        const diff = Math.ceil((new Date(d.dueDate).getTime() - today.getTime()) / 86400000)
                        return diff <= 7
                      })
                      if (urgent.length === 0) return null
                      return (
                        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-3 border-b border-red-200">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <span className="text-sm font-semibold text-red-700">
                              {urgent.length} deadline{urgent.length > 1 ? "s" : ""} need{urgent.length === 1 ? "s" : ""} attention
                            </span>
                          </div>
                          <div className="divide-y divide-red-100">
                            {urgent.map(deadline => {
                              const urgency = getDeadlineUrgency(deadline.dueDate, deadline.completed)
                              let formattedDate = deadline.dueDate
                              try { formattedDate = format(new Date(deadline.dueDate), "MMM d, yyyy") } catch {}
                              return (
                                <div key={deadline.id} className="flex items-center gap-3 px-4 py-2.5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium flex-shrink-0 ${urgency.color}`}>
                                    {urgency.label}
                                  </span>
                                  <span className="text-sm font-medium text-[#3d3d3d] flex-1 min-w-0 truncate">{deadline.title}</span>
                                  <span className="text-xs text-[#6b675f] flex-shrink-0">{formattedDate}</span>
                                  <input
                                    type="checkbox"
                                    checked={deadline.completed}
                                    onChange={() => handleToggleDeadlineComplete(deadline.id)}
                                    className="w-4 h-4 flex-shrink-0 cursor-pointer accent-[#3d3d3d]"
                                    title="Mark complete"
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}

                    {/* All Deadlines Section */}
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9b9b9b] mb-4">All Deadlines</p>
                    <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#d4cfca]"></div>
                      {deadlines.length === 0 ? (
                        <p className="pl-16 pb-8 text-sm text-[#9b9b9b]">No deadlines yet.</p>
                      ) : deadlines.map((deadline) => {
                        const urgency = getDeadlineUrgency(deadline.dueDate, deadline.completed)
                        let formattedDate = deadline.dueDate
                        try { formattedDate = format(new Date(deadline.dueDate), "MMM d, yyyy") } catch {}
                        const dotColor = deadline.completed
                          ? "bg-green-500"
                          : urgency.color.includes("red") ? "bg-red-500"
                          : urgency.color.includes("orange") ? "bg-orange-400"
                          : urgency.color.includes("amber") ? "bg-amber-400"
                          : urgency.color.includes("blue") ? "bg-blue-400"
                          : "bg-[#9b9b9b]"
                        return (
                          <div key={deadline.id} className="relative pl-16 pb-8">
                            <div className={`absolute left-4 top-2 w-5 h-5 rounded-full ${dotColor} border-4 border-white shadow-sm`}></div>
                            <div className={`bg-white rounded-lg border border-[#e5e5e5] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow ${deadline.completed ? "opacity-60" : ""}`}>
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className={`text-base font-semibold text-[#3d3d3d] ${deadline.completed ? "line-through" : ""}`}>
                                  {deadline.title}
                                </h3>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${urgency.color}`}>
                                    {urgency.label}
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={deadline.completed}
                                    onChange={() => handleToggleDeadlineComplete(deadline.id)}
                                    className="w-4 h-4 rounded border-[#d0d0d0] cursor-pointer accent-[#3d3d3d]"
                                    title="Mark complete"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-[#6b675f] mb-2 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays className="w-4 h-4" />
                                  <span>{formattedDate}</span>
                                </div>
                                {deadline.trigger && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#ebe9e6] text-[#6b675f]">
                                    Trigger: {deadline.trigger}
                                  </span>
                                )}
                                {deadline.window && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#ebe9e6] text-[#6b675f]">
                                    {deadline.window}
                                  </span>
                                )}
                                {(deadline as any).authority && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#ebe9e6] text-[#6b675f]">
                                    {(deadline as any).authority}
                                  </span>
                                )}
                              </div>
                              {deadline.description && (
                                <p className="text-sm text-[#6b675f]">{deadline.description}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Milestones Section */}
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9b9b9b] mt-8 mb-4">Milestones</p>
                    <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#d4cfca]"></div>
                      {milestones.length === 0 ? (
                        <p className="pl-16 pb-8 text-sm text-[#9b9b9b]">No milestones yet.</p>
                      ) : milestones.map((milestone) => (
                        <div key={milestone.id} className="relative pl-16 pb-8">
                          <div className="absolute left-4 top-2 w-5 h-5 rounded-full bg-[#3d3d3d] border-4 border-white shadow-sm"></div>
                          <div className="bg-white rounded-lg border border-[#e5e5e5] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-base font-semibold text-[#3d3d3d] mb-2">{milestone.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-[#6b675f] mb-2">
                              <div className="flex items-center gap-1.5">
                                <CalendarDays className="w-4 h-4" />
                                <span>{milestone.date}</span>
                              </div>
                            </div>
                            <p className="text-sm text-[#6b675f]">{milestone.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Key Dates Section */}
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9b9b9b] mt-8 mb-4">Key Dates</p>
                    <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#c5d8f5]"></div>
                      {keyDates.length === 0 ? (
                        <p className="pl-16 pb-8 text-sm text-[#9b9b9b]">No key dates recorded yet.</p>
                      ) : keyDates.map((kd) => {
                        let formattedDate = kd.date
                        try { formattedDate = format(new Date(kd.date + "T00:00:00"), "MMM d, yyyy") } catch {}
                        return (
                          <div key={kd.id} className="relative pl-16 pb-8">
                            <div className="absolute left-4 top-2 w-5 h-5 rounded-full bg-[#5b8dd9] border-4 border-white shadow-sm flex items-center justify-center">
                            </div>
                            <div className="bg-[#f5f9ff] rounded-lg border border-[#c5d8f5] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="text-base font-semibold text-[#3d3d3d]">{kd.title}</h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#ddeeff] text-[#3d6baa] flex-shrink-0">
                                  Key date
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-[#6b675f]">
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays className="w-4 h-4 text-[#5b8dd9]" />
                                  <span>{formattedDate}</span>
                                </div>
                              </div>
                              {kd.notes && (
                                <p className="text-sm text-[#6b675f] mt-2">{kd.notes}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                  </div>
                </div>
              </>
            ) : activeNav === "legal" ? (
              // Legal View
              <div className="flex-1 overflow-auto bg-[#f5f4f2]">
                {(() => {
                  const legal = legalInfo[selectedEstate.id] || {}
                  const formatDate = (d: string) => d ? new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"
                  const lField = (field: string, placeholder = "", type = "text") => (
                    <input
                      type={type}
                      value={legalEditForm[field] || ""}
                      onChange={e => setLegalEditForm((p: any) => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full h-9 px-3 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]"
                    />
                  )
                  const lLabel = (text: string) => <label className="block text-xs font-medium text-[#6b675f] mb-1">{text}</label>
                  const lVal = (label: string, value: string) => (
                    <div>
                      <p className="text-xs text-[#6b675f] mb-1.5">{label}</p>
                      <p className="text-sm font-semibold text-[#3d3d3d]">{value || "—"}</p>
                    </div>
                  )
                  const saveSection = () => {
                    setLegalInfo((prev: any) => ({ ...prev, [selectedEstate.id]: { ...(prev[selectedEstate.id] || {}), ...legalEditForm } }))
                    setLegalEditSection(null)
                  }
                  const startEdit = (section: string) => { setLegalEditForm({ ...legal }); setLegalEditSection(section) }
                  const CardEditBtn = ({ section }: { section: string }) => (
                    <button onClick={() => startEdit(section)} className="flex items-center gap-1 text-xs text-[#6b675f] hover:text-[#3d3d3d] transition-colors">
                      <Edit className="w-3 h-3" /><span>Edit</span>
                    </button>
                  )
                  const CardActions = () => (
                    <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#f0f0f0]">
                      <button onClick={() => setLegalEditSection(null)} className="h-8 px-3 text-xs font-medium text-[#6b675f] hover:text-[#3d3d3d] border border-[#d0d0d0] hover:border-[#3d3d3d] rounded-md transition-colors">Cancel</button>
                      <button onClick={saveSection} className="h-8 px-4 text-xs font-medium text-white bg-[#3d3d3d] hover:bg-[#2d2d2d] rounded-md transition-colors">Save</button>
                    </div>
                  )
                  return (
                    <div className="max-w-4xl mx-auto py-6 px-6 space-y-5">

                      {/* Legal Authority */}
                      <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
                        <div className="border-l-4 border-[#3d3d3d] px-5 py-3 bg-[#fafafa] border-b border-[#e5e5e5] flex items-center justify-between">
                          <h3 className="text-[11px] font-bold text-[#3d3d3d] uppercase tracking-widest">Legal Authority</h3>
                          {legalEditSection !== "authority" && <CardEditBtn section="authority" />}
                        </div>
                        {legalEditSection === "authority" ? (
                          <>
                            <div className="px-5 py-5 space-y-4">
                              <div className="grid grid-cols-3 gap-5">
                                <div>
                                  {lLabel("Authority Type")}
                                  <select
                                    value={legalEditForm.authorityType || ""}
                                    onChange={e => setLegalEditForm((p: any) => ({ ...p, authorityType: e.target.value }))}
                                    className="w-full h-9 px-3 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]"
                                  >
                                    <option value="">Select…</option>
                                    <option value="Trust">Trust</option>
                                    <option value="Estate (SEA)">Estate (SEA)</option>
                                    <option value="Estate (Probate)">Estate (Probate)</option>
                                    <option value="Estate (Lawyer Required)">Estate (Lawyer Required)</option>
                                    <option value="Trust & Estate">Trust &amp; Estate</option>
                                  </select>
                                </div>
                                <div>{lLabel("Case #")}{lField("caseNumber", "e.g. 24-PR-00412")}</div>
                                <div>{lLabel("Jurisdiction")}{lField("jurisdiction", "e.g. Essex County Surrogate's Court")}</div>
                              </div>
                              <div className="grid grid-cols-3 gap-5 items-start">
                                <div>
                                  {lLabel("Bond")}
                                  <select
                                    value={legalEditForm.bondStatus || ""}
                                    onChange={e => setLegalEditForm((p: any) => ({ ...p, bondStatus: e.target.value }))}
                                    className="w-full h-9 px-3 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]"
                                  >
                                    <option value="">Select…</option>
                                    <option value="Waived">Waived</option>
                                    <option value="Required">Required</option>
                                  </select>
                                </div>
                                {legalEditForm.bondStatus === "Required" && (
                                  <div>{lLabel("Bond Amount")}{lField("bondAmount", "e.g. 25000")}</div>
                                )}
                              </div>
                            </div>
                            <CardActions />
                          </>
                        ) : (
                          <div className="px-5 py-5 space-y-5">
                            <div className="grid grid-cols-3 gap-8">
                              {lVal("Authority Type", legal.authorityType)}
                              <div>
                                <p className="text-xs text-[#6b675f] mb-1.5">Case #</p>
                                <p className="text-sm font-semibold text-[#3d3d3d] font-mono">{legal.caseNumber || "—"}</p>
                              </div>
                              {lVal("Jurisdiction", legal.jurisdiction)}
                            </div>
                            <div className="grid grid-cols-3 gap-8">
                              <div>
                                <p className="text-xs text-[#6b675f] mb-1.5">Bond</p>
                                <p className="text-sm font-semibold text-[#3d3d3d]">{legal.bondStatus || "—"}</p>
                              </div>
                              {legal.bondStatus === "Required" && (
                                <div>
                                  <p className="text-xs text-[#6b675f] mb-1.5">Bond Amount</p>
                                  <p className="text-sm font-semibold text-[#3d3d3d]">${Number(legal.bondAmount || 0).toLocaleString()}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Court Details */}
                      <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
                        <div className="border-l-4 border-[#3d3d3d] px-5 py-3 bg-[#fafafa] border-b border-[#e5e5e5] flex items-center justify-between">
                          <h3 className="text-[11px] font-bold text-[#3d3d3d] uppercase tracking-widest">Court Details</h3>
                          {legalEditSection !== "court" && <CardEditBtn section="court" />}
                        </div>
                        {legalEditSection === "court" ? (
                          <>
                            <div className="px-5 py-5 space-y-4">
                              <div>{lLabel("Street Address")}{lField("courtStreet", "Street address")}</div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-1">{lLabel("City")}{lField("courtCity", "City")}</div>
                                <div>{lLabel("State")}{lField("courtState", "State")}</div>
                                <div>{lLabel("ZIP")}{lField("courtZip", "ZIP")}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-5">
                                <div>{lLabel("Phone")}{lField("courtPhone", "e.g. (973) 693-6800")}</div>
                                <div>{lLabel("Website")}{lField("courtWebsite", "https://")}</div>
                              </div>
                              <div>
                                {lLabel("Hours of Operation")}
                                <select
                                  value={legalEditForm.courtHoursPreset || ""}
                                  onChange={e => setLegalEditForm((p: any) => ({ ...p, courtHoursPreset: e.target.value }))}
                                  className="w-full h-9 px-3 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]"
                                >
                                  <option value="">Select hours…</option>
                                  <option>Mon–Fri, 8:00am–4:00pm</option>
                                  <option>Mon–Fri, 8:30am–4:30pm</option>
                                  <option>Mon–Fri, 9:00am–5:00pm</option>
                                  <option>Mon–Fri, 8:00am–5:00pm</option>
                                  <option>Mon–Thu, 8:30am–4:30pm</option>
                                  <option>Other</option>
                                </select>
                                <input
                                  type="text"
                                  value={legalEditForm.courtHoursNote || ""}
                                  onChange={e => setLegalEditForm((p: any) => ({ ...p, courtHoursNote: e.target.value }))}
                                  placeholder="Exceptions or notes (e.g. Closed 12–1pm for lunch)"
                                  className="w-full h-9 px-3 mt-2 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]"
                                />
                              </div>
                            </div>
                            <CardActions />
                          </>
                        ) : (
                          <div className="px-5 py-5 space-y-5">
                            <div>
                              <p className="text-xs text-[#6b675f] mb-1.5">Court Address</p>
                              {legal.courtStreet ? (
                                <div className="text-sm font-semibold text-[#3d3d3d] leading-relaxed">
                                  <p>{legal.courtStreet}</p>
                                  <p>{legal.courtCity}, {legal.courtState} {legal.courtZip}</p>
                                </div>
                              ) : <p className="text-sm font-semibold text-[#3d3d3d]">—</p>}
                            </div>
                            <div className="grid grid-cols-3 gap-8">
                              {lVal("Phone", legal.courtPhone)}
                              <div>
                                <p className="text-xs text-[#6b675f] mb-1.5">Website</p>
                                {legal.courtWebsite
                                  ? <a href={legal.courtWebsite} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline truncate block">{legal.courtWebsite}</a>
                                  : <p className="text-sm font-semibold text-[#3d3d3d]">—</p>}
                              </div>
                              <div>
                                <p className="text-xs text-[#6b675f] mb-1.5">Hours of Operation</p>
                                <p className="text-sm font-semibold text-[#3d3d3d]">{legal.courtHoursPreset || "—"}</p>
                                {legal.courtHoursNote && <p className="text-xs text-[#6b675f] mt-1">{legal.courtHoursNote}</p>}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Probate Referee */}
                      <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
                        <div className="border-l-4 border-[#3d3d3d] px-5 py-3 bg-[#fafafa] border-b border-[#e5e5e5] flex items-center justify-between">
                          <h3 className="text-[11px] font-bold text-[#3d3d3d] uppercase tracking-widest">Probate Referee</h3>
                          {legalEditSection !== "referee" && <CardEditBtn section="referee" />}
                        </div>
                        {legalEditSection === "referee" ? (
                          <>
                            <div className="px-5 py-5 space-y-5">
                              <div className="grid grid-cols-2 gap-5">
                                <div>{lLabel("Name")}{lField("refereeName", "Full name")}</div>
                                <div>{lLabel("Phone")}{lField("refereePhone", "e.g. (415) 555-0100")}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-5">
                                <div>{lLabel("Address")}{lField("refereeAddress", "Street, City, State, ZIP")}</div>
                                <div>{lLabel("Email")}{lField("refereeEmail", "e.g. referee@example.com")}</div>
                              </div>
                            </div>
                            <CardActions />
                          </>
                        ) : (
                          <div className="px-5 py-5 space-y-4">
                            <div className="grid grid-cols-2 gap-8">
                              {lVal("Name", legal.refereeName)}
                              {lVal("Phone", legal.refereePhone)}
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                              {lVal("Address", legal.refereeAddress)}
                              {lVal("Email", legal.refereeEmail)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Key Dates & Milestones — read-only, sourced from Timeline */}
                      <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
                        <div className="border-l-4 border-[#6b675f] px-5 py-3 bg-[#fafafa] border-b border-[#e5e5e5] flex items-center justify-between">
                          <div>
                            <h3 className="text-[11px] font-bold text-[#3d3d3d] uppercase tracking-widest">Key Dates &amp; Milestones</h3>
                            <p className="text-[11px] text-[#9b9b9b] mt-0.5">Sourced from Timeline — edit there to make changes</p>
                          </div>
                          <button
                            onClick={() => setActiveNav("timeline")}
                            className="flex items-center gap-1 text-xs text-[#6b675f] hover:text-[#3d3d3d] transition-colors"
                          >
                            <span>Go to Timeline</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        {(() => {
                          const allDates: Array<{ label: string; date: string; notes: string; type: "milestone" | "keydate" }> = [
                            ...milestones.map(m => ({
                              label: m.name,
                              date: m.date,
                              notes: m.description || "",
                              type: "milestone" as const
                            })),
                            ...keyDates.map(kd => ({
                              label: kd.title,
                              date: kd.date,
                              notes: kd.notes || "",
                              type: "keydate" as const
                            }))
                          ].sort((a, b) => {
                            const parseDate = (d: string) => {
                              const iso = Date.parse(d)
                              return isNaN(iso) ? Date.parse(new Date(d).toISOString()) : iso
                            }
                            return parseDate(a.date) - parseDate(b.date)
                          })
                          if (allDates.length === 0) {
                            return (
                              <div className="px-5 py-8 text-center text-sm text-[#9b9b9b]">
                                No milestones or key dates yet. Add them in Timeline.
                              </div>
                            )
                          }
                          return (
                            <div className="divide-y divide-[#f0f0f0]">
                              {allDates.map((item, i) => (
                                <div key={i} className="px-5 py-3 flex items-start gap-4">
                                  <span className={`mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${item.type === "milestone" ? "bg-[#ececec] text-[#3d3d3d]" : "bg-blue-50 text-blue-700"}`}>
                                    {item.type === "milestone" ? "Milestone" : "Key Date"}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#3d3d3d]">{item.label}</p>
                                    {item.notes && <p className="text-xs text-[#6b675f] mt-0.5 leading-relaxed">{item.notes}</p>}
                                  </div>
                                  <p className="text-xs text-[#6b675f] flex-shrink-0 mt-0.5">{item.date}</p>
                                </div>
                              ))}
                            </div>
                          )
                        })()}
                      </div>

                    </div>
                  )
                })()}
              </div>
            ) : activeNav === "jobs-board" ? (
              // Jobs Board View
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Jobs Board Header */}
                <div className="bg-white border-b border-[#e5e5e5] px-6 py-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-[#6b675f]">Estate ID:&nbsp;&nbsp;{selectedEstate.id}</span>
                    <button className="text-[#6b675f] hover:text-[#3d3d3d]"><Copy className="w-3.5 h-3.5" /></button>
                  </div>
                  {selectedEstate.scanBoxId && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-[#6b675f]">Scan Box ID:&nbsp;&nbsp;{selectedEstate.scanBoxId}</span>
                      <button className="text-[#6b675f] hover:text-[#3d3d3d]"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-[#3d3d3d] mb-0.5">
                    Estate of:&nbsp;&nbsp;{[estateData[selectedEstate.id]?.firstName, estateData[selectedEstate.id]?.middleName, estateData[selectedEstate.id]?.lastName, estateData[selectedEstate.id]?.suffix].filter(Boolean).join(" ") || selectedEstate.name}
                  </h2>
                  {selectedEstate.executors?.length > 0 && (
                    <p className="text-sm text-[#6b675f]">Executor(s):&nbsp;&nbsp;{selectedEstate.executors.join(", ")}</p>
                  )}
                </div>

                {/* Toolbar */}
                <div className="bg-white border-b border-[#e5e5e5] px-6 py-3 flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9b9b9b]" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={jobsSearch}
                      onChange={e => setJobsSearch(e.target.value)}
                      className="pl-9 pr-3 h-9 w-52 text-sm bg-[#f8f7f5] border border-[#e5e5e5] rounded-md text-[#3d3d3d] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]"
                    />
                  </div>
                  <select
                    value={jobsPriority}
                    onChange={e => setJobsPriority(e.target.value)}
                    className="h-9 px-3 text-sm border border-[#e5e5e5] rounded-md bg-[#f8f7f5] text-[#6b675f] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]"
                  >
                    <option value="all">Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <Button className="ml-auto bg-[#7c6fc4] hover:bg-[#6b5eb3] text-white h-9 text-sm px-4">
                    Create task
                  </Button>
                </div>

                {/* Kanban Board */}
                <div className="flex-1 overflow-auto p-5">
                  {(() => {
                    const tasksWithState = JOBS_BOARD_TASKS
                      .filter(t => taskVisibility[t.id] !== false)
                      .map(t => ({ ...t, status: (taskStatuses[t.id] ?? t.status) as typeof t.status }))
                    const filtered = tasksWithState.filter(t =>
                      !jobsSearch || t.title.toLowerCase().includes(jobsSearch.toLowerCase()) || t.slug.toLowerCase().includes(jobsSearch.toLowerCase())
                    )
                    const todoTasks = filtered.filter(t => t.status === "todo")
                    const inProgressTasks = filtered.filter(t => t.status === "in-progress")
                    const awaitingTasks = filtered.filter(t => t.status === "awaiting-review")
                    const completedTasks = filtered.filter(t => t.status === "completed")

                    const TaskCard = ({ task }: { task: typeof JOBS_BOARD_TASKS[0] }) => {
                      const isProcessing = taskProcessing[task.id]
                      const hasError = !!taskError[task.id]
                      return (
                        <div
                          className="bg-white rounded-lg border border-[#e5e5e5] p-4 hover:border-[#c0bcb6] hover:shadow-sm transition-all cursor-pointer"
                          onClick={() => openTaskModal(task.id)}
                        >
                          <p className="text-[10px] text-[#9b9b9b] font-mono mb-1.5 leading-tight truncate">{task.slug}</p>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <p className="text-sm font-semibold text-[#3d3d3d] leading-snug">{task.title}</p>
                            {isProcessing && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                Processing
                              </span>
                            )}
                            {hasError && !isProcessing && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 shrink-0">
                                <AlertCircle className="w-2.5 h-2.5" />
                                Error
                              </span>
                            )}
                          </div>
                          {task.steps && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] text-[#6b675f]">{task.steps.done} / {task.steps.total} steps completed</span>
                              </div>
                              <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: task.steps.total > 0 ? `${(task.steps.done / task.steps.total) * 100}%` : "0%",
                                    backgroundColor: task.steps.done === task.steps.total && task.steps.total > 0 ? "#22c55e" : "#7c6fc4"
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <User className="w-3.5 h-3.5 text-[#9b9b9b]" />
                            <span className="text-[11px] text-[#6b675f]">{task.assignee}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#9b9b9b]" />
                              <span className="text-[11px] text-[#6b675f]">{task.createdAt}</span>
                            </div>
                            <button
                              className="text-[11px] text-[#7c6fc4] hover:text-[#5a4fa0] flex items-center gap-0.5 font-medium"
                              onClick={e => { e.stopPropagation(); openTaskModal(task.id) }}
                            >
                              View estate <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )
                    }

                    const Column = ({ title, tasks, badgeColor }: { title: string; tasks: typeof JOBS_BOARD_TASKS; badgeColor: string }) => (
                      <div className="flex flex-col w-72 flex-shrink-0">
                        <div className="flex items-center gap-2 mb-3 px-0.5">
                          <span className="text-sm font-semibold text-[#3d3d3d]">{title}</span>
                          <span className={`text-xs rounded px-1.5 py-0.5 font-semibold ${badgeColor}`}>{tasks.length}</span>
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                          {tasks.map(task => <TaskCard key={task.id} task={task} />)}
                          {tasks.length === 0 && (
                            <div className="border-2 border-dashed border-[#e5e5e5] rounded-lg h-20 flex items-center justify-center">
                              <span className="text-xs text-[#c0c0c0]">No tasks</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )

                    return (
                      <div className="flex gap-4 items-start min-w-max pb-4">
                        <Column title="To Do" tasks={todoTasks} badgeColor="bg-[#3d3d3d] text-white" />
                        <Column title="In Progress" tasks={inProgressTasks} badgeColor="bg-blue-50 text-blue-600 border border-blue-200" />
                        <Column title="Awaiting Review" tasks={awaitingTasks} badgeColor="bg-amber-50 text-amber-600 border border-amber-200" />
                        <Column title="Completed" tasks={completedTasks} badgeColor="bg-[#3d3d3d] text-white" />
                      </div>
                    )
                  })()}
                </div>

                {/* Task Detail Modal */}
                {taskModalOpen && (() => {
                  const task = JOBS_BOARD_TASKS.find(t => t.id === taskModalId)
                  if (!task) return null
                  return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setTaskModalOpen(false)}>
                      <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}
                      >
                        {/* Modal top bar */}
                        <div className="flex items-start justify-between px-8 pt-6 pb-4 border-b border-[#f0f0f0]">
                          <div>
                            <p className="text-[11px] text-[#9b9b9b] font-mono mb-1">{task.slug}</p>
                            <h2 className="text-xl font-bold text-[#1a1a2e]">{task.title}</h2>
                          </div>
                          <button onClick={() => setTaskModalOpen(false)} className="text-[#9b9b9b] hover:text-[#3d3d3d] ml-4 mt-1">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Modal body */}
                        <div className="flex flex-1 overflow-hidden">
                          {/* Left panel */}
                          <div className="flex-1 overflow-auto px-8 py-6 space-y-8">
                            {task.slug === "validate_asset_classification" ? (
                              <>
                                {/* Description (always visible) */}
                                {task.description && (
                                  <div>
                                    <h3 className="text-sm font-semibold text-[#3d3d3d] mb-3">Description</h3>
                                    <p className="text-sm text-[#4a4a4a] leading-relaxed">{task.description}</p>
                                  </div>
                                )}

                                {/* PROCESSING state */}
                                {taskProcessing[task.id] && (
                                  <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                      <BarChart3 className="w-4 h-4 text-[#7c6fc4]" />
                                      <h3 className="text-sm font-semibold text-[#3d3d3d]">Asset Classification</h3>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4">
                                      <Loader2 className="w-5 h-5 text-[#7c6fc4] animate-spin" />
                                      <span className="text-sm text-[#6b675f]">SAUL is classifying assets...</span>
                                    </div>
                                    <p className="text-xs text-[#9b9b9b] mt-3">This usually takes a few seconds. We'll update this card when it's ready to review.</p>
                                  </div>
                                )}

                                {/* ERROR state */}
                                {taskError[task.id] && !taskProcessing[task.id] && (
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                                    <div className="flex items-start gap-3">
                                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-red-800 mb-1">Classification failed</h4>
                                        <p className="text-sm text-red-700">{taskError[task.id]}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* REVIEW state */}
                                {!taskProcessing[task.id] && !taskError[task.id] && classificationData && !classificationApproved && (() => {
                                  const allAssets = [...classificationData.classification.assets, ...newClassifiedAssets]
                                  const blockedPaths = classificationData.plan.blocked_paths
                                  return (
                                    <>
                                      {/* Blocked paths banner */}
                                      {blockedPaths.length > 0 && (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Ban className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-xs font-semibold text-gray-600 uppercase">Blocked paths</span>
                                          </div>
                                          <div className="ml-6 space-y-1">
                                            {blockedPaths.map((bp, i) => (
                                              <p key={`bp-${i}`} className="text-sm text-gray-700">
                                                <span className="font-medium">{bp.procedure}</span> — {bp.reason}
                                              </p>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Asset table */}
                                      <div>
                                        <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                                          <div className="grid grid-cols-[1fr_140px_90px] gap-2 px-4 py-2.5 bg-[#fafafa] border-b border-[#e5e5e5]">
                                            <span className="text-[10px] font-semibold text-[#9b9b9b] uppercase tracking-wider">Asset</span>
                                            <span className="text-[10px] font-semibold text-[#9b9b9b] uppercase tracking-wider">Bucket</span>
                                            <span className="text-[10px] font-semibold text-[#9b9b9b] uppercase tracking-wider">Confidence</span>
                                          </div>
                                          {allAssets.map((asset, idx) => {
                                            const isUnvalidated = (asset as { validated?: boolean }).validated === false
                                            const isNew = (asset as { isNew?: boolean }).isNew === true
                                            const effectiveBucket = bucketOverrides[idx] ?? asset.bucket
                                            const bucketCfg = BUCKET_CONFIG[effectiveBucket] ?? BUCKET_CONFIG.PROBATE
                                            const isOverridden = idx in bucketOverrides
                                            const isLowConfidence = asset.confidence < 0.70
                                            const confidenceLevel = asset.confidence >= 0.90 ? "high" : asset.confidence >= 0.70 ? "medium" : "low"
                                            const confidenceColor = confidenceLevel === "high" ? "bg-green-500" : confidenceLevel === "medium" ? "bg-amber-400" : "bg-red-500"
                                            const confidenceLabel = confidenceLevel === "high" ? "High" : confidenceLevel === "medium" ? "Medium" : "Low"
                                            const rowBg = isUnvalidated ? "bg-gray-50/60" : isLowConfidence ? "bg-red-50/40" : ""
                                            return (
                                              <div key={idx}>
                                                <div className={`grid grid-cols-[1fr_140px_90px] gap-2 px-4 py-3 border-b border-[#f0f0f0] items-start ${rowBg}`}>
                                                  <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                      <span className="text-sm text-[#3d3d3d] font-medium">{asset.asset}</span>
                                                      {isUnvalidated && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-400 border border-gray-200">Unvalidated — provisional</span>
                                                      )}
                                                      {isNew && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">New — needs review</span>
                                                      )}
                                                    </div>
                                                    <p className="text-xs text-[#9b9b9b] leading-relaxed mt-0.5">{asset.reason}</p>
                                                    {isUnvalidated && (asset as { validation_note?: string }).validation_note && (
                                                      <p className="text-xs text-gray-400 mt-0.5 italic">{(asset as { validation_note?: string }).validation_note}</p>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <div className={`relative inline-flex items-center rounded-md ${bucketCfg.bg} border ${bucketCfg.border}`}>
                                                      <select
                                                        value={effectiveBucket}
                                                        onChange={e => {
                                                          const newBucket = e.target.value
                                                          if (newBucket === asset.bucket) {
                                                            setBucketOverrides(prev => { const next = { ...prev }; delete next[idx]; return next })
                                                            setOverrideReasons(prev => { const next = { ...prev }; delete next[idx]; return next })
                                                          } else {
                                                            setBucketOverrides(prev => ({ ...prev, [idx]: newBucket }))
                                                          }
                                                        }}
                                                        className={`text-xs font-medium ${bucketCfg.text} bg-transparent pl-2.5 pr-6 py-1 appearance-none cursor-pointer focus:outline-none`}
                                                      >
                                                        {BUCKET_OPTIONS.map(key => (
                                                          <option key={key} value={key}>{BUCKET_CONFIG[key].label}</option>
                                                        ))}
                                                      </select>
                                                      <ChevronDown className={`w-3 h-3 ${bucketCfg.text} absolute right-1.5 pointer-events-none`} />
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full ${confidenceColor} flex-shrink-0`} />
                                                    <span className={`text-xs ${confidenceLevel === "low" ? "text-red-600 font-medium" : "text-[#6b675f]"}`}>{confidenceLabel}</span>
                                                  </div>
                                                </div>
                                                {isOverridden && (
                                                  <div className="px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0]">
                                                    <label className="block text-xs text-[#9b9b9b] mb-1.5">Why are you changing this classification? <span className="text-red-500">*</span></label>
                                                    <Input
                                                      value={overrideReasons[idx] ?? ""}
                                                      onChange={e => setOverrideReasons(prev => ({ ...prev, [idx]: e.target.value }))}
                                                      placeholder="Enter reason for override..."
                                                      className={`h-8 text-sm ${!overrideReasons[idx]?.trim() ? "border-red-300 focus:border-red-400" : "border-[#e5e5e5]"}`}
                                                    />
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          })}
                                        </div>

                                        {/* Refresh assets */}
                                        <div className="mt-3 flex items-center gap-3">
                                          {refreshingAssets ? (
                                            <div className="flex items-center gap-2 text-sm text-[#6b675f]">
                                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7c6fc4]" />
                                              SAUL is refreshing assets...
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                handleRefreshAssets()
                                                if (taskStatuses.t2 === "completed") {
                                                  setTaskVisibility(prev => ({ ...prev, t4: true }))
                                                  startSaulForTask("t4")
                                                }
                                              }}
                                              className="flex items-center gap-1.5 text-sm text-[#7c6fc4] hover:text-[#5a4fa0] font-medium"
                                            >
                                              <RefreshCw className="w-3.5 h-3.5" />
                                              Refresh assets
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )
                                })()}

                                {/* APPROVED state */}
                                {classificationApproved && (
                                  <div className="flex flex-col items-center justify-center py-16">
                                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                                    <h3 className="text-lg font-semibold text-[#3d3d3d] mb-1">Classification approved</h3>
                                    <p className="text-sm text-[#9b9b9b]">Closing...</p>
                                  </div>
                                )}
                              </>
                            ) : task.slug === "validate_legal_administration_path" ? (
                              <>
                                {/* Description (always visible) */}
                                {task.description && (
                                  <div>
                                    <h3 className="text-sm font-semibold text-[#3d3d3d] mb-3">Description</h3>
                                    <p className="text-sm text-[#4a4a4a] leading-relaxed">{task.description}</p>
                                  </div>
                                )}

                                {/* PROCESSING state */}
                                {taskProcessing[task.id] && (
                                  <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FileCheck className="w-4 h-4 text-[#7c6fc4]" />
                                      <h3 className="text-sm font-semibold text-[#3d3d3d]">Legal Path Determination</h3>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4">
                                      <Loader2 className="w-5 h-5 text-[#7c6fc4] animate-spin" />
                                      <span className="text-sm text-[#6b675f]">SAUL is evaluating the legal path...</span>
                                    </div>
                                  </div>
                                )}

                                {/* ERROR state */}
                                {taskError[task.id] && !taskProcessing[task.id] && (
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                                    <div className="flex items-start gap-3">
                                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-red-800 mb-1">Evaluation failed</h4>
                                        <p className="text-sm text-red-700">{taskError[task.id]}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* REVIEW state */}
                                {!taskProcessing[task.id] && !taskError[task.id] && legalPathData && !legalPathApproved && (() => {
                                  const { threshold_evaluation, legal_path, plan } = legalPathData
                                  const primaryCfg = LEGAL_PATH_CONFIG[legal_path.primary] ?? LEGAL_PATH_CONFIG.PROBATE_INDEPENDENT_ADMINISTRATION
                                  const effectivePath = legalPathOverride ?? legal_path.primary
                                  const effectiveCfg = LEGAL_PATH_CONFIG[effectivePath] ?? primaryCfg

                                  return (
                                    <>
                                      {/* Section 1 — Threshold evaluation */}
                                      <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-lg px-5 py-4">
                                        <h4 className="text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider mb-3">Threshold Evaluation</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-[#6b675f]">Probate estate value</span>
                                            <span className="font-medium text-[#3d3d3d]">${threshold_evaluation.PROBATE.countable_value.toLocaleString()}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-[#6b675f]">SEA threshold (CA)</span>
                                            <span className="font-medium text-[#3d3d3d]">${threshold_evaluation.SEA.threshold.toLocaleString()}</span>
                                          </div>
                                          <div className="border-t border-[#e5e5e5] my-2" />
                                          <div className="flex justify-between">
                                            <span className="text-[#6b675f]">SEA qualified?</span>
                                            <span className={`font-medium ${threshold_evaluation.SEA.qualified ? "text-green-600" : "text-red-600"}`}>
                                              {threshold_evaluation.SEA.qualified ? "✓ Yes" : "✗ No — exceeds threshold"}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-[#6b675f]">Probate required?</span>
                                            <span className={`font-medium ${threshold_evaluation.PROBATE.qualified ? "text-green-600" : "text-red-600"}`}>
                                              {threshold_evaluation.PROBATE.qualified ? "✓ Yes" : "✗ No"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Section 2 — Recommended legal path */}
                                      <div>
                                        <h4 className="text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider mb-3">Primary path</h4>
                                        <div className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium ${primaryCfg.bg} ${primaryCfg.text} border ${primaryCfg.border}`}>
                                          {primaryCfg.label}
                                        </div>
                                        <p className="text-sm text-[#4a4a4a] leading-relaxed mt-3">{legal_path.reason}</p>

                                        {/* Parallel tracks */}
                                        {legal_path.parallel_tracks.length > 0 && (
                                          <div className="mt-5">
                                            <h4 className="text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider mb-3">Running in parallel</h4>
                                            <div className="space-y-2">
                                              {legal_path.parallel_tracks.map((pt, i) => {
                                                const trackCfg = LEGAL_PATH_CONFIG[pt.track] ?? LEGAL_PATH_CONFIG.NON_PROBATE
                                                return (
                                                  <div key={i} className="flex items-center gap-2 flex-wrap">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${trackCfg.bg} ${trackCfg.text} border ${trackCfg.border}`}>
                                                      {trackCfg.label}
                                                    </span>
                                                    <span className="text-sm text-[#6b675f]">{pt.assets.join(" · ")}</span>
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          </div>
                                        )}

                                        {/* Override control */}
                                        <div className="mt-6 pt-5 border-t border-[#f0f0f0]">
                                          <label className="block text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider mb-2">Override primary path (optional)</label>
                                          <div className={`relative inline-flex items-center rounded-md border ${effectiveCfg.border} ${effectiveCfg.bg}`}>
                                            <select
                                              value={effectivePath}
                                              onChange={e => {
                                                const val = e.target.value
                                                if (val === legal_path.primary) {
                                                  setLegalPathOverride(null)
                                                  setLegalPathOverrideReason("")
                                                } else {
                                                  setLegalPathOverride(val)
                                                }
                                              }}
                                              className={`text-sm font-medium ${effectiveCfg.text} bg-transparent pl-3 pr-7 py-1.5 appearance-none cursor-pointer focus:outline-none`}
                                            >
                                              {LEGAL_PATH_OPTIONS.map(key => (
                                                <option key={key} value={key}>{LEGAL_PATH_CONFIG[key].label}</option>
                                              ))}
                                            </select>
                                            <ChevronDown className={`w-3.5 h-3.5 ${effectiveCfg.text} absolute right-2 pointer-events-none`} />
                                          </div>
                                          {legalPathOverride && (
                                            <div className="mt-3">
                                              <label className="block text-xs text-[#9b9b9b] mb-1.5">Why are you overriding this determination? <span className="text-red-500">*</span></label>
                                              <Input
                                                value={legalPathOverrideReason}
                                                onChange={e => setLegalPathOverrideReason(e.target.value)}
                                                placeholder="Enter reason for override..."
                                                className={`h-8 text-sm ${!legalPathOverrideReason.trim() ? "border-red-300 focus:border-red-400" : "border-[#e5e5e5]"}`}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                    </>
                                  )
                                })()}

                                {/* APPROVED state */}
                                {legalPathApproved && (
                                  <div className="flex flex-col items-center justify-center py-16">
                                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                                    <h3 className="text-lg font-semibold text-[#3d3d3d] mb-1">Legal path approved</h3>
                                    <p className="text-sm text-[#9b9b9b]">Closing...</p>
                                  </div>
                                )}
                              </>
                            ) : task.slug === "validate_probate_plan" ? (
                              <>
                                {/* Description (always visible) */}
                                {task.description && (
                                  <div>
                                    <h3 className="text-sm font-semibold text-[#3d3d3d] mb-3">Description</h3>
                                    <p className="text-sm text-[#4a4a4a] leading-relaxed">{task.description}</p>
                                  </div>
                                )}

                                {/* PROCESSING state */}
                                {taskProcessing[task.id] && (
                                  <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                      <ClipboardList className="w-4 h-4 text-[#7c6fc4]" />
                                      <h3 className="text-sm font-semibold text-[#3d3d3d]">Settlement Plan</h3>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4">
                                      <Loader2 className="w-5 h-5 text-[#7c6fc4] animate-spin" />
                                      <span className="text-sm text-[#6b675f]">SAUL is building the settlement plan...</span>
                                    </div>
                                  </div>
                                )}

                                {/* ERROR state */}
                                {taskError[task.id] && !taskProcessing[task.id] && (
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                                    <div className="flex items-start gap-3">
                                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-red-800 mb-1">Plan generation failed</h4>
                                        <p className="text-sm text-red-700">{taskError[task.id]}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* REVIEW state */}
                                {!taskProcessing[task.id] && !taskError[task.id] && probatePlanData && !probatePlanApproved && (() => {
                                  const { estate_summary, plan } = probatePlanData
                                  const approvedPathCfg = LEGAL_PATH_CONFIG[estate_summary.approved_path] ?? LEGAL_PATH_CONFIG.PROBATE_INDEPENDENT_ADMINISTRATION
                                  const highFlags = plan.flags.filter(f => f.severity === "HIGH")
                                  const totalActions = plan.tracks.reduce((sum, tr) => sum + tr.actions.length, 0)

                                  return (
                                    <>
                                      {/* Section 1 — Missed deadline flags */}
                                      {highFlags.length > 0 && (
                                        <div className="space-y-2">
                                          {highFlags.map((flag, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                                              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                              <p className="text-sm text-amber-800">{flag.description}</p>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Section 2 — Estate summary card */}
                                      <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-lg px-5 py-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <h4 className="text-sm font-semibold text-[#3d3d3d]">{estate_summary.estate_name}</h4>
                                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${approvedPathCfg.bg} ${approvedPathCfg.text} ${approvedPathCfg.border}`}>
                                            {approvedPathCfg.label}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-[#6b675f] mb-3">
                                          <span className="font-medium text-[#3d3d3d]">${estate_summary.probate_estate_value.toLocaleString()}</span>
                                          <span className="text-[#d0d0d0]">&middot;</span>
                                          <span>{estate_summary.probate_assets} probate</span>
                                          <span className="text-[#d0d0d0]">&middot;</span>
                                          <span>{estate_summary.non_probate_assets} non-probate</span>
                                          <span className="text-[#d0d0d0]">&middot;</span>
                                          <span>{plan.tracks.length} tracks</span>
                                        </div>
                                        <p className="text-sm text-[#6b675f] leading-relaxed">{estate_summary.summary}</p>
                                      </div>

                                      {/* Section 3 — Action plan by track */}
                                      <div className="space-y-5">
                                        <h4 className="text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider">Action plan by track</h4>
                                        {plan.tracks.map((track, ti) => {
                                          const trackCfg = LEGAL_PATH_CONFIG[track.track] ?? LEGAL_PATH_CONFIG.PROBATE
                                          return (
                                            <div key={ti} className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                                              <div className={`flex items-center gap-2 px-4 py-3 border-b border-[#e5e5e5] ${trackCfg.bg}`}>
                                                <span className={`text-xs font-semibold ${trackCfg.text}`}>{track.label}</span>
                                              </div>
                                              <p className="text-xs text-[#6b675f] px-4 py-2 bg-white border-b border-[#f0f0f0]">{track.description}</p>
                                              <div className="divide-y divide-[#f0f0f0]">
                                                {track.actions.map((action) => {
                                                  const isOverdue = action.status === "overdue"
                                                  const isNa = !!naActions[action.id]
                                                  return (
                                                    <div
                                                      key={action.id}
                                                      className={`px-4 py-3 bg-white ${isOverdue ? "border-l-2 border-red-400" : ""} ${isNa ? "opacity-50" : ""}`}
                                                    >
                                                      <div className="flex items-start justify-between gap-3">
                                                        <p className="text-sm text-[#3d3d3d] leading-relaxed flex-1">{action.description}</p>
                                                        <button
                                                          onClick={() => {
                                                            setNaActions(prev => ({ ...prev, [action.id]: !prev[action.id] }))
                                                            if (naActions[action.id]) {
                                                              setNaReasons(prev => { const next = { ...prev }; delete next[action.id]; return next })
                                                            }
                                                          }}
                                                          className={`shrink-0 text-xs px-2 py-1 rounded border transition-colors ${isNa ? "bg-gray-100 border-gray-300 text-gray-500" : "bg-white border-[#d0d0d0] text-[#6b675f] hover:bg-[#f8f7f5]"}`}
                                                        >
                                                          {isNa ? "Revert" : "Mark N/A"}
                                                        </button>
                                                      </div>
                                                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                        <span className={`text-xs px-2 py-0.5 rounded ${isOverdue ? "bg-red-50 text-red-600 font-medium" : "bg-gray-100 text-[#6b675f]"}`}>
                                                          {action.deadline}
                                                        </span>
                                                        {action.required_forms.map((form, fi) => (
                                                          <span key={fi} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-[#6b675f] font-mono">{form}</span>
                                                        ))}
                                                      </div>
                                                      {isNa && (
                                                        <div className="mt-2">
                                                          <label className="block text-xs text-[#9b9b9b] mb-1">Why is this action not applicable? <span className="text-red-500">*</span></label>
                                                          <Input
                                                            value={naReasons[action.id] ?? ""}
                                                            onChange={e => setNaReasons(prev => ({ ...prev, [action.id]: e.target.value }))}
                                                            placeholder="Enter reason..."
                                                            className={`h-8 text-sm ${!(naReasons[action.id] ?? "").trim() ? "border-red-300 focus:border-red-400" : "border-[#e5e5e5]"}`}
                                                          />
                                                        </div>
                                                      )}
                                                    </div>
                                                  )
                                                })}
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>

                                      {/* Section 4 — Sequencing notes */}
                                      <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-lg px-5 py-4">
                                        <div className="flex items-center gap-2 mb-3">
                                          <ArrowRight className="w-4 h-4 text-[#9b9b9b]" />
                                          <h4 className="text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider">Sequencing notes</h4>
                                        </div>
                                        <ul className="space-y-2">
                                          {plan.sequencing_notes.map((note, i) => (
                                            <li key={i} className="text-sm text-[#6b675f] leading-relaxed">{note}</li>
                                          ))}
                                        </ul>
                                      </div>

                                      {/* Blocked paths */}
                                      {plan.blocked_paths.length > 0 && (
                                        <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-lg px-5 py-4">
                                          <div className="flex items-center gap-2 mb-3">
                                            <Ban className="w-4 h-4 text-[#9b9b9b]" />
                                            <h4 className="text-xs font-semibold text-[#9b9b9b] uppercase tracking-wider">Blocked paths</h4>
                                          </div>
                                          <div className="space-y-1.5">
                                            {plan.blocked_paths.map((bp, i) => (
                                              <p key={i} className="text-sm text-[#6b675f]">
                                                <span className="font-medium text-[#3d3d3d]">{bp.procedure}</span> — {bp.reason}
                                              </p>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )
                                })()}

                                {/* APPROVED state */}
                                {probatePlanApproved && (
                                  <div className="flex flex-col items-center justify-center py-16">
                                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                                    <h3 className="text-lg font-semibold text-[#3d3d3d] mb-1">Settlement plan approved</h3>
                                    <p className="text-sm text-[#9b9b9b]">Closing...</p>
                                  </div>
                                )}
                              </>
                            ) : task.slug === "revalidate_asset_classification" ? (
                              <>
                                {/* Description (always visible) */}
                                {task.description && (
                                  <div>
                                    <h3 className="text-sm font-semibold text-[#3d3d3d] mb-3">Description</h3>
                                    <p className="text-sm text-[#4a4a4a] leading-relaxed">{task.description}</p>
                                  </div>
                                )}

                                {/* PROCESSING state */}
                                {taskProcessing[task.id] && (
                                  <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                      <BarChart3 className="w-4 h-4 text-[#7c6fc4]" />
                                      <h3 className="text-sm font-semibold text-[#3d3d3d]">Asset Re-classification</h3>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4">
                                      <Loader2 className="w-5 h-5 text-[#7c6fc4] animate-spin" />
                                      <span className="text-sm text-[#6b675f]">SAUL is re-classifying the new asset...</span>
                                    </div>
                                    <p className="text-xs text-[#9b9b9b] mt-3">This usually takes a few seconds. We'll update this card when it's ready to review.</p>
                                  </div>
                                )}

                                {/* ERROR state */}
                                {taskError[task.id] && !taskProcessing[task.id] && (
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                                    <div className="flex items-start gap-3">
                                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-red-800 mb-1">Re-classification failed</h4>
                                        <p className="text-sm text-red-700">{taskError[task.id]}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* REVIEW state */}
                                {!taskProcessing[task.id] && !taskError[task.id] && t4Ready && !t4Approved && (() => {
                                  const asset = SAUL_REVALIDATE_ASSET
                                  const idx = 0
                                  const effectiveBucket = bucketOverrides[idx] ?? asset.bucket
                                  const bucketCfg = BUCKET_CONFIG[effectiveBucket] ?? BUCKET_CONFIG.PROBATE
                                  const isOverridden = idx in bucketOverrides
                                  const confidenceLevel = asset.confidence >= 0.90 ? "high" : asset.confidence >= 0.70 ? "medium" : "low"
                                  const confidenceColor = confidenceLevel === "high" ? "bg-green-500" : confidenceLevel === "medium" ? "bg-amber-400" : "bg-red-500"
                                  const confidenceLabel = confidenceLevel === "high" ? "High" : confidenceLevel === "medium" ? "Medium" : "Low"
                                  return (
                                    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                                      <div className="grid grid-cols-[1fr_140px_90px] gap-2 px-4 py-2.5 bg-[#fafafa] border-b border-[#e5e5e5]">
                                        <span className="text-[10px] font-semibold text-[#9b9b9b] uppercase tracking-wider">Asset</span>
                                        <span className="text-[10px] font-semibold text-[#9b9b9b] uppercase tracking-wider">Bucket</span>
                                        <span className="text-[10px] font-semibold text-[#9b9b9b] uppercase tracking-wider">Confidence</span>
                                      </div>
                                      <div>
                                        <div className="grid grid-cols-[1fr_140px_90px] gap-2 px-4 py-3 border-b border-[#f0f0f0] items-start">
                                          <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-sm text-[#3d3d3d] font-medium">{asset.asset}</span>
                                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">New — needs review</span>
                                            </div>
                                            <p className="text-xs text-[#9b9b9b] leading-relaxed mt-0.5">{asset.reason}</p>
                                          </div>
                                          <div>
                                            <div className={`relative inline-flex items-center rounded-md ${bucketCfg.bg} border ${bucketCfg.border}`}>
                                              <select
                                                value={effectiveBucket}
                                                onChange={e => {
                                                  const newBucket = e.target.value
                                                  if (newBucket === asset.bucket) {
                                                    setBucketOverrides(prev => { const next = { ...prev }; delete next[idx]; return next })
                                                    setOverrideReasons(prev => { const next = { ...prev }; delete next[idx]; return next })
                                                  } else {
                                                    setBucketOverrides(prev => ({ ...prev, [idx]: newBucket }))
                                                  }
                                                }}
                                                className={`text-xs font-medium ${bucketCfg.text} bg-transparent pl-2.5 pr-6 py-1 appearance-none cursor-pointer focus:outline-none`}
                                              >
                                                {BUCKET_OPTIONS.map(key => (
                                                  <option key={key} value={key}>{BUCKET_CONFIG[key].label}</option>
                                                ))}
                                              </select>
                                              <ChevronDown className={`w-3 h-3 ${bucketCfg.text} absolute right-1.5 pointer-events-none`} />
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${confidenceColor} flex-shrink-0`} />
                                            <span className="text-xs text-[#6b675f]">{confidenceLabel}</span>
                                          </div>
                                        </div>
                                        {isOverridden && (
                                          <div className="px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0]">
                                            <label className="block text-xs text-[#9b9b9b] mb-1.5">Why are you changing this classification? <span className="text-red-500">*</span></label>
                                            <Input
                                              value={overrideReasons[idx] ?? ""}
                                              onChange={e => setOverrideReasons(prev => ({ ...prev, [idx]: e.target.value }))}
                                              placeholder="Enter reason for override..."
                                              className={`h-8 text-sm ${!overrideReasons[idx]?.trim() ? "border-red-300 focus:border-red-400" : "border-[#e5e5e5]"}`}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })()}

                                {/* APPROVED state */}
                                {t4Approved && (
                                  <div className="flex flex-col items-center justify-center py-16">
                                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                                    <h3 className="text-lg font-semibold text-[#3d3d3d] mb-1">Re-classification approved</h3>
                                    <p className="text-sm text-[#9b9b9b]">Closing...</p>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                {/* Description */}
                                {task.description && (
                                  <div>
                                    <h3 className="text-sm font-semibold text-[#3d3d3d] mb-3">Description</h3>
                                    <p className="text-sm text-[#4a4a4a] leading-relaxed">{task.description}</p>
                                  </div>
                                )}

                                {/* Steps */}
                                {task.stepItems && task.stepItems.length > 0 && (
                                  <div>
                                    <h3 className="text-sm font-semibold text-[#3d3d3d] mb-4">Steps</h3>
                                    <div className="space-y-3">
                                      {task.stepItems.map(step => (
                                        <div key={step.id} className="flex items-start gap-3">
                                          <input
                                            type="checkbox"
                                            checked={!!taskStepChecked[`${task.id}-${step.id}`]}
                                            onChange={e => setTaskStepChecked(prev => ({ ...prev, [`${task.id}-${step.id}`]: e.target.checked }))}
                                            className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border-[#d0d0d0] accent-[#1a1a2e] cursor-pointer"
                                          />
                                          <div className="flex items-start gap-3 flex-1 bg-[#fafafa] border border-[#f0f0f0] rounded-lg px-4 py-3">
                                            <span className="flex-shrink-0 w-7 h-7 bg-[#1a1a2e] text-white rounded-full flex items-center justify-center text-xs font-bold">{step.id}</span>
                                            <p className="text-sm text-[#3d3d3d] leading-relaxed">{step.text}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Attachments */}
                                <div>
                                  <h3 className="text-sm font-semibold text-[#3d3d3d] mb-3">Attachments</h3>
                                  <div className="border-2 border-dashed border-[#e5e5e5] rounded-lg px-6 py-5 flex items-center justify-center gap-3 cursor-pointer hover:border-[#c0bcb6] transition-colors">
                                    <Upload className="w-5 h-5 text-[#9b9b9b]" />
                                    <span className="text-sm text-[#6b675f]">Drag and drop files here, or click to select</span>
                                  </div>
                                  <p className="text-xs text-[#9b9b9b] text-center mt-3">No attachments yet</p>
                                </div>

                                <div className="border-t border-[#f0f0f0]" />

                                {/* Activity */}
                                <div>
                                  <h3 className="text-sm font-semibold text-[#3d3d3d] mb-4">Activity</h3>
                                  <div className="flex gap-6 border-b border-[#e5e5e5] mb-5">
                                    <button
                                      onClick={() => setTaskModalTab("conversations")}
                                      className={`pb-2 text-sm font-medium border-b-2 transition-colors ${taskModalTab === "conversations" ? "border-[#1a1a2e] text-[#1a1a2e]" : "border-transparent text-[#9b9b9b] hover:text-[#3d3d3d]"}`}
                                    >
                                      Conversations
                                    </button>
                                    <button
                                      onClick={() => setTaskModalTab("history")}
                                      className={`pb-2 text-sm font-medium border-b-2 transition-colors ${taskModalTab === "history" ? "border-[#1a1a2e] text-[#1a1a2e]" : "border-transparent text-[#9b9b9b] hover:text-[#3d3d3d]"}`}
                                    >
                                      History
                                    </button>
                                  </div>
                                  {taskModalTab === "conversations" && (
                                    <p className="text-sm text-[#9b9b9b] italic">No conversations yet</p>
                                  )}
                                  {taskModalTab === "history" && (
                                    <p className="text-sm text-[#9b9b9b] italic">No history yet</p>
                                  )}
                                </div>

                                {/* Add Comment */}
                                <div>
                                  <h3 className="text-sm font-semibold text-[#3d3d3d] mb-3">Add Comment</h3>
                                  <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                                    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#f0f0f0] bg-[#fafafa]">
                                      <select className="text-xs text-[#6b675f] bg-transparent border-none outline-none pr-1">
                                        <option>Change t…</option>
                                      </select>
                                      <div className="w-px h-4 bg-[#e5e5e5]" />
                                      {["B","I","U","S"].map(f => (
                                        <button key={f} className="text-xs font-bold text-[#6b675f] hover:text-[#3d3d3d] w-6 h-6 flex items-center justify-center rounded hover:bg-[#e5e5e5]">{f}</button>
                                      ))}
                                      <div className="w-px h-4 bg-[#e5e5e5]" />
                                      <button className="text-xs text-[#6b675f] hover:text-[#3d3d3d] w-6 h-6 flex items-center justify-center rounded hover:bg-[#e5e5e5]">≡</button>
                                      <button className="text-xs text-[#6b675f] hover:text-[#3d3d3d] w-6 h-6 flex items-center justify-center rounded hover:bg-[#e5e5e5]">⋮≡</button>
                                    </div>
                                    <textarea
                                      value={taskComment}
                                      onChange={e => setTaskComment(e.target.value)}
                                      rows={3}
                                      className="w-full px-3 py-3 text-sm text-[#3d3d3d] placeholder:text-[#c0c0c0] resize-none focus:outline-none"
                                      placeholder=""
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Right panel - Details */}
                          <div className="w-64 border-l border-[#f0f0f0] px-6 py-6 flex-shrink-0 overflow-auto">
                            <h3 className="text-sm font-semibold text-[#3d3d3d] mb-5">Details</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-[10px] font-semibold text-[#9b9b9b] uppercase tracking-wider mb-1.5">Status</label>
                                <div className="relative">
                                  <select className="w-full h-9 pl-3 pr-8 text-sm border border-[#e5e5e5] rounded-md bg-white text-[#6b675f] focus:outline-none appearance-none">
                                    <option value="todo">To Do</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="awaiting-review">Awaiting Review</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9b9b9b] pointer-events-none text-xs">▾</span>
                                </div>
                                <span className="inline-flex mt-1.5 items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f5f0e8] text-[#8a6d3b] border border-[#e8d9b8]">To Do</span>
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#9b9b9b] uppercase tracking-wider mb-1.5">Priority</label>
                                <div className="relative">
                                  <select className="w-full h-9 pl-3 pr-8 text-sm border border-[#e5e5e5] rounded-md bg-white text-[#6b675f] focus:outline-none appearance-none">
                                    <option value="">Priority</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                  </select>
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9b9b9b] pointer-events-none text-xs">▾</span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#9b9b9b] uppercase tracking-wider mb-1.5">Assignee</label>
                                <div className="relative">
                                  <select className="w-full h-9 pl-3 pr-8 text-sm border border-[#e5e5e5] rounded-md bg-white text-[#3d3d3d] focus:outline-none appearance-none">
                                    <option>{task.assignee}{task.assigneeEmail ? ` (${task.assigneeEmail})` : ""}</option>
                                  </select>
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9b9b9b] pointer-events-none text-xs">▾</span>
                                </div>
                              </div>
                              {task.reviewer && (
                                <div className="flex items-start gap-2 pt-1">
                                  <UserCircle className="w-4 h-4 text-[#9b9b9b] flex-shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-[11px] text-[#9b9b9b] font-semibold">Reviewer:&nbsp;</span>
                                    <span className="text-[11px] text-[#3d3d3d]">{task.reviewer}</span>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-start gap-2">
                                <CalendarDays className="w-4 h-4 text-[#9b9b9b] flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[11px] text-[#9b9b9b] font-semibold">Created:&nbsp;</span>
                                  <span className="text-[11px] text-[#3d3d3d]">{task.createdAt}</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <CalendarDays className="w-4 h-4 text-[#9b9b9b] flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[11px] text-[#9b9b9b] font-semibold">Updated:&nbsp;</span>
                                  <span className="text-[11px] text-[#3d3d3d]">{task.updatedAt}</span>
                                </div>
                              </div>
                              {task.jobVersion && (
                                <div>
                                  <span className="text-[11px] text-[#9b9b9b] font-semibold">Job Version:&nbsp;</span>
                                  <span className="text-[11px] text-[#3d3d3d]">{task.jobVersion}</span>
                                </div>
                              )}
                              {task.jobId && (
                                <div>
                                  <span className="text-[11px] text-[#9b9b9b] font-semibold">Job ID:&nbsp;</span>
                                  <span className="text-[11px] text-[#7c6fc4] font-mono break-all">{task.jobId}</span>
                                </div>
                              )}
                              <div className="pt-2">
                                <button className="text-sm text-[#7c6fc4] hover:text-[#5a4fa0] font-medium">Send Feedback</button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Modal footer */}
                        {task.slug === "validate_asset_classification" ? (
                          <>
                            {classificationApproved ? null : !taskProcessing[task.id] && !taskError[task.id] && classificationData ? (
                              <div className="flex items-center justify-between px-8 py-4 border-t border-[#f0f0f0]">
                                <div className="flex items-center gap-1.5 text-xs text-[#6b675f]">
                                  <span>{classificationData.classification.assets.length + newClassifiedAssets.length} assets classified</span>
                                  <span className="text-[#d0d0d0]">&middot;</span>
                                  <span>{classificationData.classification.assets.filter(a => a.confidence < 0.70).length} low confidence</span>
                                </div>
                                <Button
                                  onClick={handleApproveClassification}
                                  disabled={Object.keys(bucketOverrides).some(idx => !overrideReasons[Number(idx)]?.trim())}
                                  className="bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white h-9 px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Approve classification &rarr;
                                </Button>
                              </div>
                            ) : taskError[task.id] && !taskProcessing[task.id] ? (
                              <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-[#f0f0f0]">
                                <Button
                                  onClick={() => setTaskModalOpen(false)}
                                  className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] h-9 px-5 text-sm"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleRetryTask(task.id)}
                                  className="bg-[#7c6fc4] hover:bg-[#5a4fa0] text-white h-9 px-5 text-sm"
                                >
                                  Retry
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-[#f0f0f0]">
                                <Button
                                  onClick={() => setTaskModalOpen(false)}
                                  className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] h-9 px-5 text-sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </>
                        ) : task.slug === "validate_legal_administration_path" ? (
                          <>
                            {legalPathApproved ? null : !taskProcessing[task.id] && !taskError[task.id] && legalPathData ? (
                              <div className="flex items-center justify-between px-8 py-4 border-t border-[#f0f0f0]">
                                <div className="flex items-center gap-1.5 text-xs text-[#6b675f]">
                                  <span>Primary: {(LEGAL_PATH_CONFIG[legalPathOverride ?? legalPathData.legal_path.primary] ?? LEGAL_PATH_CONFIG.PROBATE_INDEPENDENT_ADMINISTRATION).label}</span>
                                  <span className="text-[#d0d0d0]">&middot;</span>
                                  <span>{legalPathData.legal_path.parallel_tracks.length + 1} tracks</span>
                                </div>
                                <Button
                                  onClick={handleApproveLegalPath}
                                  disabled={!!legalPathOverride && !legalPathOverrideReason.trim()}
                                  className="bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white h-9 px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Approve legal path &rarr;
                                </Button>
                              </div>
                            ) : taskError[task.id] && !taskProcessing[task.id] ? (
                              <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-[#f0f0f0]">
                                <Button
                                  onClick={() => setTaskModalOpen(false)}
                                  className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] h-9 px-5 text-sm"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleRetryTask(task.id)}
                                  className="bg-[#7c6fc4] hover:bg-[#5a4fa0] text-white h-9 px-5 text-sm"
                                >
                                  Retry
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-[#f0f0f0]">
                                <Button
                                  onClick={() => setTaskModalOpen(false)}
                                  className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] h-9 px-5 text-sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </>
                        ) : task.slug === "validate_probate_plan" ? (
                          <>
                            {probatePlanApproved ? null : !taskProcessing[task.id] && !taskError[task.id] && probatePlanData ? (
                              <div className="flex items-center justify-between px-8 py-4 border-t border-[#f0f0f0]">
                                <div className="flex items-center gap-1.5 text-xs text-[#6b675f]">
                                  <span>{probatePlanData.plan.tracks.reduce((sum, tr) => sum + tr.actions.length, 0)} actions across {probatePlanData.plan.tracks.length} tracks</span>
                                  {probatePlanData.plan.flags.length > 0 && (
                                    <>
                                      <span className="text-[#d0d0d0]">&middot;</span>
                                      <span>{probatePlanData.plan.flags.length} flag{probatePlanData.plan.flags.length !== 1 ? "s" : ""}</span>
                                    </>
                                  )}
                                </div>
                                <Button
                                  onClick={handleApproveProbatePlan}
                                  disabled={Object.keys(naActions).some(id => naActions[id] && !(naReasons[id] ?? "").trim())}
                                  className="bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white h-9 px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Approve plan &rarr;
                                </Button>
                              </div>
                            ) : taskError[task.id] && !taskProcessing[task.id] ? (
                              <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-[#f0f0f0]">
                                <Button
                                  onClick={() => setTaskModalOpen(false)}
                                  className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] h-9 px-5 text-sm"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleRetryTask(task.id)}
                                  className="bg-[#7c6fc4] hover:bg-[#5a4fa0] text-white h-9 px-5 text-sm"
                                >
                                  Retry
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-[#f0f0f0]">
                                <Button
                                  onClick={() => setTaskModalOpen(false)}
                                  className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] h-9 px-5 text-sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </>
                        ) : task.slug === "revalidate_asset_classification" ? (
                          <>
                            {t4Approved ? null : !taskProcessing[task.id] && !taskError[task.id] && t4Ready ? (
                              <div className="flex items-center justify-between px-8 py-4 border-t border-[#f0f0f0]">
                                <div className="flex items-center gap-1.5 text-xs text-[#6b675f]">
                                  <span>1 asset classified</span>
                                </div>
                                <Button
                                  onClick={handleApproveT4}
                                  disabled={Object.keys(bucketOverrides).some(idx => !overrideReasons[Number(idx)]?.trim())}
                                  className="bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white h-9 px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Approve classification &rarr;
                                </Button>
                              </div>
                            ) : taskError[task.id] && !taskProcessing[task.id] ? (
                              <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-[#f0f0f0]">
                                <Button
                                  onClick={() => setTaskModalOpen(false)}
                                  className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] h-9 px-5 text-sm"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleRetryTask(task.id)}
                                  className="bg-[#7c6fc4] hover:bg-[#5a4fa0] text-white h-9 px-5 text-sm"
                                >
                                  Retry
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-[#f0f0f0]">
                                <Button
                                  onClick={() => setTaskModalOpen(false)}
                                  className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] h-9 px-5 text-sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-[#f0f0f0]">
                            <Button
                              onClick={() => setTaskModalOpen(false)}
                              className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] h-9 px-5 text-sm"
                            >
                              Cancel
                            </Button>
                            <Button className="bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white h-9 px-5 text-sm">
                              Save
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </div>
            ) : (
              // Original Assets/Other Views
              <>
                {/* Estate Info Header */}
                <div className="bg-white border-b border-[#e5e5e5] px-6 py-4">
                  {/* Top row: ID, copy, edit, badges + Create Contact button */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-[#6b675f]">ID: {selectedEstate.id}</span>
                      <button className="text-[#6b675f] hover:text-[#3d3d3d]">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={openEditModal} className="flex items-center gap-1 text-xs text-[#6b675f] hover:text-[#3d3d3d] border border-[#d0d0d0] hover:border-[#3d3d3d] rounded px-2 py-1 transition-colors" title="Edit estate">
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      {estateData[selectedEstate.id]?.testAccount && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-semibold tracking-wide">TEST</span>
                      )}
                    </div>
                    <Button className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] text-sm h-9 flex-shrink-0">
                      <Plus className="w-4 h-4 mr-1.5" />
                      Create New Contact
                    </Button>
                  </div>

                  {/* Estate name */}
                  <h2 className="text-lg font-semibold text-[#3d3d3d] mb-3">
                    Estate of: {[estateData[selectedEstate.id]?.firstName, estateData[selectedEstate.id]?.middleName, estateData[selectedEstate.id]?.lastName, estateData[selectedEstate.id]?.suffix].filter(Boolean).join(" ") || selectedEstate.name}
                  </h2>

                  {/* Info fields */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
                    {selectedEstate.email && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#6b675f]">Email:</span>
                        <span className="text-[#3d3d3d]">{selectedEstate.email}</span>
                        <button className="text-[#6b675f] hover:text-[#3d3d3d]"><Copy className="w-3 h-3" /></button>
                      </div>
                    )}
                    {selectedEstate.scanBoxId && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#6b675f]">Scan Box:</span>
                        <span className="text-[#3d3d3d]">{selectedEstate.scanBoxId}</span>
                        <button className="text-[#6b675f] hover:text-[#3d3d3d]"><Copy className="w-3 h-3" /></button>
                      </div>
                    )}
                    {estateData[selectedEstate.id]?.gender && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#6b675f]">Gender:</span>
                        <span className="text-[#3d3d3d]">{estateData[selectedEstate.id].gender}</span>
                      </div>
                    )}
                    {estateData[selectedEstate.id]?.dateOfBirth && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#6b675f]">DOB:</span>
                        <span className="text-[#3d3d3d]">{estateData[selectedEstate.id].dateOfBirth}</span>
                      </div>
                    )}
                    {estateData[selectedEstate.id]?.dateOfDeath && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#6b675f]">DOD:</span>
                        <span className="text-[#3d3d3d]">{estateData[selectedEstate.id].dateOfDeath}</span>
                      </div>
                    )}
                    {estateData[selectedEstate.id]?.ssn && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#6b675f]">SSN:</span>
                        <span className="text-[#3d3d3d]">***-**-{estateData[selectedEstate.id].ssn.slice(-4)}</span>
                      </div>
                    )}
                    {estateData[selectedEstate.id]?.customerStatus && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#6b675f]">Status:</span>
                        <span className="text-[#3d3d3d]">{estateData[selectedEstate.id].customerStatus}</span>
                      </div>
                    )}
                    {estateData[selectedEstate.id]?.authorityType && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#6b675f]">Authority:</span>
                        <span className="text-[#3d3d3d]">{estateData[selectedEstate.id].authorityType}</span>
                      </div>
                    )}
                    {(estateData[selectedEstate.id]?.hasTrust || estateData[selectedEstate.id]?.hasWill) && (
                      <div className="flex items-center gap-1.5">
                        {estateData[selectedEstate.id]?.hasTrust && <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">Trust</span>}
                        {estateData[selectedEstate.id]?.hasWill && <span className="bg-violet-50 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded">Will</span>}
                      </div>
                    )}
                    {estateData[selectedEstate.id]?.clickupId && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#6b675f]">ClickUp:</span>
                        <span className="text-[#3d3d3d]">{estateData[selectedEstate.id].clickupId}</span>
                      </div>
                    )}
                    {estateData[selectedEstate.id]?.probateCaseNumber && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#6b675f]">Case #:</span>
                        <span className="text-[#3d3d3d]">{estateData[selectedEstate.id].probateCaseNumber}</span>
                      </div>
                    )}
                    {estateData[selectedEstate.id]?.courtHearingDate && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#6b675f]">Court Hearing:</span>
                        <span className="text-[#3d3d3d]">{estateData[selectedEstate.id].courtHearingDate}</span>
                      </div>
                    )}
                    {(estateData[selectedEstate.id]?.lastKnownStreet || estateData[selectedEstate.id]?.lastKnownCity) && (
                      <div className="flex items-center gap-1.5 w-full">
                        <span className="text-[#6b675f]">Address:</span>
                        <span className="text-[#3d3d3d]">{[estateData[selectedEstate.id]?.lastKnownStreet, estateData[selectedEstate.id]?.lastKnownCity, estateData[selectedEstate.id]?.lastKnownState, estateData[selectedEstate.id]?.lastKnownZip].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border-b border-[#e5e5e5] px-6">
                  <div className="flex gap-6">
                    {["Assets", "Debts", "Obligations", "Expenses", "Timeline", "Contacts"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`px-1 py-3 text-[13px] border-b-2 transition-colors ${
                          activeTab === tab.toLowerCase()
                            ? "border-[#3d3d3d] text-[#3d3d3d] font-medium"
                            : "border-transparent text-[#6b675f] hover:text-[#3d3d3d]"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline Tab Content */}
                {activeTab === "timeline" ? (
                  <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-5xl mx-auto">
                      {/* Deadlines Section */}
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-[#3d3d3d]">Deadlines</h2>
                        <Button
                          onClick={() => { setShowAddDeadlineModal(true); setDeadlineModalStep(1); setDeadlineModalTrigger(null); setDeadlineModalChecked([]) }}
                          className="bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-sm h-9"
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          Add Deadline
                        </Button>
                      </div>

                      <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#ebe9e6]">
                            <tr>
                              <th className="text-left px-4 py-3 text-[#3d3d3d] font-medium text-[13px]">Title</th>
                              <th className="text-left px-4 py-3 text-[#3d3d3d] font-medium text-[13px]">Trigger</th>
                              <th className="text-left px-4 py-3 text-[#3d3d3d] font-medium text-[13px]">Window</th>
                              <th className="text-left px-4 py-3 text-[#3d3d3d] font-medium text-[13px]">Due Date</th>
                              <th className="text-left px-4 py-3 text-[#3d3d3d] font-medium text-[13px]">Status</th>
                              <th className="text-left px-4 py-3 text-[#3d3d3d] font-medium text-[13px]">Done</th>
                            </tr>
                          </thead>
                          <tbody>
                            {deadlines.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-[#6b675f] text-sm">
                                  No deadlines yet. Click "Add Deadline" to create one.
                                </td>
                              </tr>
                            ) : (
                              deadlines.map((deadline) => {
                                const urgency = getDeadlineUrgency(deadline.dueDate, deadline.completed)
                                let formattedDate = deadline.dueDate
                                try { formattedDate = format(new Date(deadline.dueDate), "MMM d, yyyy") } catch {}
                                return (
                                  <tr key={deadline.id} className={`border-t border-[#f0f0f0] hover:bg-[#fafafa] ${deadline.completed ? "opacity-50" : ""}`}>
                                    <td className={`px-4 py-3 text-[13px] font-medium text-[#3d3d3d] max-w-[200px] ${deadline.completed ? "line-through" : ""}`}>{deadline.title}</td>
                                    <td className="px-4 py-3 text-[#6b675f] text-[13px] whitespace-nowrap">{deadline.trigger || "—"}</td>
                                    <td className="px-4 py-3 text-[#6b675f] text-[13px] whitespace-nowrap">{deadline.window || "—"}</td>
                                    <td className="px-4 py-3 text-[#3d3d3d] text-[13px] whitespace-nowrap">{formattedDate}</td>
                                    <td className="px-4 py-3">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${urgency.color}`}>
                                        {urgency.label}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <input
                                        type="checkbox"
                                        checked={deadline.completed}
                                        onChange={() => handleToggleDeadlineComplete(deadline.id)}
                                        className="w-4 h-4 rounded border-[#d0d0d0] cursor-pointer accent-[#3d3d3d]"
                                      />
                                    </td>
                                  </tr>
                                )
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Milestones Section */}
                      <div className="flex items-center justify-between mt-10 mb-6">
                        <h2 className="text-lg font-semibold text-[#3d3d3d]">Milestones</h2>
                        <Button
                          onClick={() => setShowAddMilestoneModal(true)}
                          className="bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-sm h-9"
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          Add Milestone
                        </Button>
                      </div>
                      <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-[#ebe9e6]">
                            <tr>
                              <th className="text-left px-4 py-3 text-[#3d3d3d] font-medium text-[13px]">Milestone</th>
                              <th className="text-left px-4 py-3 text-[#3d3d3d] font-medium text-[13px]">Date</th>
                              <th className="text-left px-4 py-3 text-[#3d3d3d] font-medium text-[13px]">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {milestones.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-[#6b675f] text-sm">
                                  No milestones yet. Click "Add Milestone" to create one.
                                </td>
                              </tr>
                            ) : (
                              milestones.map((milestone) => (
                                <tr key={milestone.id} className="border-t border-[#f0f0f0] hover:bg-[#fafafa]">
                                  <td className="px-4 py-3 text-[#3d3d3d] text-[13px] font-medium">{milestone.name}</td>
                                  <td className="px-4 py-3 text-[#3d3d3d] text-[13px]">{milestone.date}</td>
                                  <td className="px-4 py-3 text-[#6b675f] text-[13px]">{milestone.description}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Key Dates Section */}
                      <div className="flex items-center justify-between mt-10 mb-6">
                        <div>
                          <h2 className="text-lg font-semibold text-[#3d3d3d]">Key Dates</h2>
                          <p className="text-[12px] text-[#9b9b9b] mt-0.5">Reference dates — no deadline logic, just dates to track and refer back to</p>
                        </div>
                        <Button
                          onClick={() => { setShowAddDeadlineModal(true); setDeadlineModalStep(2); setDeadlineModalTrigger("key-date") }}
                          className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] text-sm h-9"
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          Add Key Date
                        </Button>
                      </div>
                      <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#f5f9ff]">
                            <tr>
                              <th className="text-left px-4 py-3 text-[#3d3d3d] font-medium text-[13px]">Title</th>
                              <th className="text-left px-4 py-3 text-[#3d3d3d] font-medium text-[13px]">Date</th>
                              <th className="text-left px-4 py-3 text-[#3d3d3d] font-medium text-[13px]">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {keyDates.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-[#6b675f] text-sm">
                                  No key dates yet. Use "Add Key Date" to record a reference date.
                                </td>
                              </tr>
                            ) : (
                              keyDates.map((kd) => {
                                let formattedDate = kd.date
                                try { formattedDate = format(new Date(kd.date + "T00:00:00"), "MMM d, yyyy") } catch {}
                                return (
                                  <tr key={kd.id} className="border-t border-[#f0f0f0] hover:bg-[#fafafa]">
                                    <td className="px-4 py-3 text-[13px] font-medium text-[#3d3d3d]">{kd.title}</td>
                                    <td className="px-4 py-3 text-[#3d3d3d] text-[13px] whitespace-nowrap">{formattedDate}</td>
                                    <td className="px-4 py-3 text-[#6b675f] text-[13px]">{kd.notes || "—"}</td>
                                  </tr>
                                )
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  </div>
                ) : (
                  <>
                    {/* Filters */}
                    <div className="bg-white border-b border-[#e5e5e5] px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-xs">
                          <Input
                            type="text"
                            placeholder="Search"
                            className="w-full h-9 text-sm bg-white border-[#d0d0d0] text-[#3d3d3d] placeholder:text-[#9b9b9b]"
                          />
                        </div>
                        <select className="h-9 px-3 py-1.5 bg-white border border-[#d0d0d0] rounded-md text-[#6b675f] text-sm">
                          <option>Status</option>
                        </select>
                        <select className="h-9 px-3 py-1.5 bg-white border border-[#d0d0d0] rounded-md text-[#6b675f] text-[13px]">
                          <option>Type</option>
                        </select>
                        <Button className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] ml-auto text-sm h-9">
                          <Plus className="w-4 h-4 mr-1.5" />
                          Add New Asset
                        </Button>
                      </div>
                    </div>

                    {/* Real Estate Section */}
                    <div className="flex-1 overflow-auto p-6">
                  <h3 className="text-base font-semibold text-[#3d3d3d] mb-3">Real Estate</h3>
                  <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#ebe9e6]">
                        <tr>
                          <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">Description</th>
                          <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">Type</th>
                          <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">Address</th>
                          <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">City</th>
                          <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">State</th>
                          <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">Value</th>
                          <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">Status</th>
                          <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEstate.assets && selectedEstate.assets.length > 0 ? (
                          selectedEstate.assets.map((asset: any, index: number) => (
                            <tr key={index} className="border-t border-[#f0f0f0] hover:bg-[#fafafa]">
                              <td className="px-4 py-3 text-[#3d3d3d] text-[13px]"></td>
                              <td className="px-4 py-3 text-[#3d3d3d] text-[13px]">{asset.type}</td>
                              <td className="px-4 py-3 text-[#3d3d3d] text-[13px]">{asset.address}</td>
                              <td className="px-4 py-3 text-[#3d3d3d] text-[13px]">{asset.city}</td>
                              <td className="px-4 py-3 text-[#3d3d3d] text-[13px]">{asset.state}</td>
                              <td className="px-4 py-3 text-[#3d3d3d] text-[13px]">{asset.value}</td>
                              <td className="px-4 py-3 text-[#3d3d3d] text-[13px]">{asset.status}</td>
                              <td className="px-4 py-3">
                                <button className="text-[#6b675f] hover:text-[#3d3d3d]">
                                  <Edit className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-[#6b675f] text-[13px]">
                              No real estate assets found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                  </>
                )}
              </>
            )}
          </main>

          {/* Right Side Agent Text */}
          <div className="flex items-center justify-center bg-[#2d2d2d] px-2">
            <div className="writing-mode-vertical-rl rotate-180 text-white font-semibold tracking-widest text-sm">
              AI AGENT
            </div>
          </div>
        </div>

        {/* Add Milestone Modal */}
        {showAddMilestoneModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5]">
                <h2 className="text-lg font-semibold text-[#3d3d3d]">Add Milestone</h2>
                <button
                  onClick={() => {
                    setShowAddMilestoneModal(false)
                    setNewMilestoneName("")
                    setNewMilestoneDate("")
                    setNewMilestoneDescription("")
                  }}
                  className="p-2 hover:bg-[#f8f7f5] rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b675f]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6 space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-[#3d3d3d] mb-1.5">
                    Name <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={newMilestoneName}
                    onChange={(e) => setNewMilestoneName(e.target.value)}
                    className="w-full h-9 px-3 py-1.5 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d] focus:border-transparent"
                  >
                    <option value="">Select a milestone...</option>
                    <option value="Closed WON">Closed WON</option>
                    <option value="K.Y.C.">K.Y.C.</option>
                    <option value="Determine Legal Path">Determine Legal Path</option>
                    <option value="File for Authority">File for Authority</option>
                    <option value="Initial Court Date">Initial Court Date</option>
                    <option value="Authority Granted">Authority Granted</option>
                    <option value="Establish Operating Bank Account">Establish Operating Bank Account</option>
                    <option value="File Distribution Order">File Distribution Order</option>
                    <option value="File Tax Return">File Tax Return</option>
                    <option value="File To Close">File To Close</option>
                    <option value="Estate Closed">Estate Closed</option>
                  </select>
                </div>

                {/* Date Field */}
                <div>
                  <label className="block text-sm font-medium text-[#3d3d3d] mb-1.5">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="date"
                    value={newMilestoneDate}
                    onChange={(e) => setNewMilestoneDate(e.target.value)}
                    className="w-full h-9 text-sm bg-white border-[#d0d0d0] text-[#3d3d3d]"
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium text-[#3d3d3d] mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={newMilestoneDescription}
                    onChange={(e) => setNewMilestoneDescription(e.target.value)}
                    placeholder="Enter milestone details..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d] focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e5e5] bg-[#fafafa]">
                <Button
                  onClick={() => {
                    setShowAddMilestoneModal(false)
                    setNewMilestoneName("")
                    setNewMilestoneDate("")
                    setNewMilestoneDescription("")
                  }}
                  className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] text-sm h-9"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMilestone}
                  className="bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-sm h-9"
                >
                  Save Milestone
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add Deadline Modal */}
        {showAddDeadlineModal && (() => {
          const selectedCategory = deadlineModalTrigger && deadlineModalTrigger !== "custom"
            ? DEADLINE_CATEGORIES.find(c => c.key === deadlineModalTrigger)
            : null

          const milestoneRawDate = selectedCategory ? getMilestoneDate(selectedCategory.triggerKeyword) : ""
          let milestoneDateDisplay = milestoneRawDate
          try {
            if (milestoneRawDate) {
              const d = new Date(milestoneRawDate)
              if (!isNaN(d.getTime())) milestoneDateDisplay = format(d, "MMM d, yyyy")
            }
          } catch {}

          const checkedCount = deadlineModalChecked.length

          return (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={resetDeadlineModal}>
              <div
                className="bg-white w-full max-w-[520px] border border-[#d0d0d0] rounded-sm max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e5e5e5] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {deadlineModalStep === 2 && (
                      <button
                        onClick={() => { setDeadlineModalStep(1); setDeadlineModalTrigger(null); setDeadlineModalChecked([]); setDeadlineModalWindowOverrides({}) }}
                        className="text-[#6b675f] hover:text-[#3d3d3d] transition-colors mr-1"
                        aria-label="Back"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                    )}
                    <span className="text-[13px] font-semibold text-[#3d3d3d] tracking-tight">
                      {deadlineModalTrigger === "key-date" ? "Add key date" : "Add deadline"}
                    </span>
                    {deadlineModalStep === 2 && selectedCategory && (
                      <span className="text-[11px] text-[#9b9b9b] font-normal ml-1">{selectedCategory.label}</span>
                    )}
                  </div>
                  <button onClick={resetDeadlineModal} className="p-1 hover:bg-[#f0f0f0] rounded transition-colors" aria-label="Close">
                    <X className="w-4 h-4 text-[#9b9b9b]" />
                  </button>
                </div>

                {/* Step 1 — Category selection */}
                {deadlineModalStep === 1 && (
                  <div className="px-5 py-5 overflow-y-auto">
                    <p className="text-[12px] text-[#9b9b9b] mb-4 leading-relaxed">What would you like to add?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {DEADLINE_CATEGORIES.map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => {
                            setDeadlineModalTrigger(cat.key)
                            setDeadlineModalStep(2)
                            setDeadlineModalChecked(cat.items.map(i => i.title))
                          }}
                          className="text-left p-3.5 border border-[#e0e0e0] rounded-sm hover:border-[#3d3d3d] hover:bg-[#fafafa] transition-colors group h-full"
                        >
                          <p className="text-[12px] font-semibold text-[#3d3d3d] mb-0.5 leading-snug group-hover:text-[#1a1a1a]">{cat.label}</p>
                          <p className="text-[10px] text-[#b0b0b0] mb-2 leading-snug">{cat.subtitle}</p>
                          <ul className="space-y-0.5">
                            {cat.preview.map((item) => (
                              <li key={item} className="text-[11px] text-[#9b9b9b] leading-snug">{item}</li>
                            ))}
                          </ul>
                        </button>
                      ))}
                      <button
                        onClick={() => { setDeadlineModalTrigger("custom"); setDeadlineModalStep(2) }}
                        className="text-left p-3.5 border border-dashed border-[#e0e0e0] rounded-sm hover:border-[#3d3d3d] hover:bg-[#fafafa] transition-colors group h-full"
                      >
                        <p className="text-[12px] font-semibold text-[#3d3d3d] mb-0.5 leading-snug group-hover:text-[#1a1a1a]">Custom deadline</p>
                        <p className="text-[10px] text-[#b0b0b0] mb-2 leading-snug">Any date or event</p>
                        <p className="text-[11px] text-[#9b9b9b] leading-snug">Set your own title, due date, and notes</p>
                      </button>
                      <button
                        onClick={() => { setDeadlineModalTrigger("key-date"); setDeadlineModalStep(2) }}
                        className="text-left p-3.5 border border-dashed border-[#c5d8f5] bg-[#f5f9ff] rounded-sm hover:border-[#3d3d3d] hover:bg-[#edf4ff] transition-colors group col-span-2"
                      >
                        <div className="flex items-start gap-3">
                          <CalendarDays className="w-4 h-4 text-[#5b8dd9] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[12px] font-semibold text-[#3d3d3d] mb-0.5 leading-snug group-hover:text-[#1a1a1a]">Key date</p>
                            <p className="text-[10px] text-[#8aabdc] mb-1 leading-snug">Record a date for reference</p>
                            <p className="text-[11px] text-[#7b9bbf] leading-snug">Log a date that already happened or is scheduled — no deadline logic, just a record to refer back to</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 — Custom form */}
                {deadlineModalStep === 2 && deadlineModalTrigger === "custom" && (
                  <div className="px-5 py-5 space-y-4 overflow-y-auto">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wider mb-1.5">Title</label>
                      <Input
                        type="text"
                        value={newDeadlineTitle}
                        onChange={(e) => setNewDeadlineTitle(e.target.value)}
                        placeholder="Deadline name"
                        className="h-8 text-[13px] bg-white border-[#d0d0d0] text-[#3d3d3d] placeholder:text-[#c0c0c0] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wider mb-1.5">Due date</label>
                      <Input
                        type="date"
                        value={newDeadlineDueDate}
                        onChange={(e) => setNewDeadlineDueDate(e.target.value)}
                        className="h-8 text-[13px] bg-white border-[#d0d0d0] text-[#3d3d3d] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wider mb-1.5">Notes</label>
                      <textarea
                        value={newDeadlineDescription}
                        onChange={(e) => setNewDeadlineDescription(e.target.value)}
                        placeholder="Optional notes"
                        rows={3}
                        className="w-full px-3 py-2 text-[13px] bg-white border border-[#d0d0d0] rounded-sm text-[#3d3d3d] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-1 focus:ring-[#3d3d3d] focus:border-transparent resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#f0f0f0]">
                      <Button onClick={resetDeadlineModal} className="h-8 px-4 bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] text-[12px] rounded-sm font-medium">Cancel</Button>
                      <Button onClick={handleAddDeadline} className="h-8 px-4 bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-[12px] rounded-sm font-medium">Add deadline</Button>
                    </div>
                  </div>
                )}

                {/* Step 2 — Key date form */}
                {deadlineModalStep === 2 && deadlineModalTrigger === "key-date" && (
                  <div className="px-5 py-5 space-y-4 overflow-y-auto">
                    <p className="text-[12px] text-[#9b9b9b] leading-relaxed">Record a date for reference — no due date logic, just something to track and refer back to on the timeline.</p>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wider mb-1.5">Title <span className="text-red-400">*</span></label>
                      <Input
                        type="text"
                        value={newKeyDateTitle}
                        onChange={(e) => setNewKeyDateTitle(e.target.value)}
                        placeholder="e.g., EIN created, Date of order, FTB notice received"
                        className="h-8 text-[13px] bg-white border-[#d0d0d0] text-[#3d3d3d] placeholder:text-[#c0c0c0] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wider mb-1.5">Date <span className="text-red-400">*</span></label>
                      <Input
                        type="date"
                        value={newKeyDateDate}
                        onChange={(e) => setNewKeyDateDate(e.target.value)}
                        className="h-8 text-[13px] bg-white border-[#d0d0d0] text-[#3d3d3d] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wider mb-1.5">Notes</label>
                      <textarea
                        value={newKeyDateNotes}
                        onChange={(e) => setNewKeyDateNotes(e.target.value)}
                        placeholder="Optional context or notes"
                        rows={3}
                        className="w-full px-3 py-2 text-[13px] bg-white border border-[#d0d0d0] rounded-sm text-[#3d3d3d] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-1 focus:ring-[#3d3d3d] focus:border-transparent resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#f0f0f0]">
                      <Button onClick={resetDeadlineModal} className="h-8 px-4 bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] text-[12px] rounded-sm font-medium">Cancel</Button>
                      <Button
                        onClick={handleAddKeyDate}
                        disabled={!newKeyDateTitle || !newKeyDateDate}
                        className="h-8 px-4 bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-[12px] rounded-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Save key date
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2 — Category checklist with editable windows */}
                {deadlineModalStep === 2 && deadlineModalTrigger !== "custom" && deadlineModalTrigger !== "key-date" && selectedCategory && (
                  <div className="flex flex-col min-h-0">
                    <div className="px-5 pt-4 overflow-y-auto flex-1">
                      {/* Trigger date pill */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f0f0f0] border border-[#e0e0e0] rounded-full mb-4">
                        <span className="text-[11px] font-medium text-[#3d3d3d]">
                          {selectedCategory.triggerLabel}{milestoneDateDisplay ? ` · ${milestoneDateDisplay}` : " · date not set"}
                        </span>
                      </div>

                      {/* Checklist */}
                      <div className="divide-y divide-[#f0f0f0] border border-[#e5e5e5] rounded-sm overflow-hidden mb-4">
                        {selectedCategory.items.map((item) => {
                          const checked = deadlineModalChecked.includes(item.title)
                          const currentValue = deadlineModalWindowOverrides[item.title] ?? item.defaultValue
                          const windowStr = `${currentValue} ${item.unit}`
                          const calcDate = milestoneRawDate ? calcDueDate(milestoneRawDate, windowStr) : ""
                          let calcDateDisplay = ""
                          try { if (calcDate) calcDateDisplay = format(new Date(calcDate + "T00:00:00"), "MMM d, yyyy") } catch {}
                          const isDefault = currentValue === item.defaultValue
                          return (
                            <div key={item.title} className={`px-3.5 py-3 transition-colors ${checked ? "hover:bg-[#fafafa]" : "bg-[#fafafa]"}`}>
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setDeadlineModalChecked(prev =>
                                      checked ? prev.filter(t => t !== item.title) : [...prev, item.title]
                                    )
                                  }}
                                  className="mt-0.5 w-3.5 h-3.5 rounded-none border-[#c0c0c0] accent-[#3d3d3d] cursor-pointer flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className={`text-[12px] font-medium leading-snug mb-1.5 ${checked ? "text-[#3d3d3d]" : "line-through text-[#c0c0c0]"}`}>
                                    {item.title}
                                  </p>
                                  {checked && (
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          min={1}
                                          value={currentValue}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value)
                                            if (!isNaN(val) && val > 0) {
                                              setDeadlineModalWindowOverrides(prev => ({ ...prev, [item.title]: val }))
                                            }
                                          }}
                                          className="w-12 h-6 px-1.5 text-[11px] border border-[#d0d0d0] rounded-sm text-center text-[#3d3d3d] focus:outline-none focus:ring-1 focus:ring-[#3d3d3d]"
                                        />
                                        <span className="text-[11px] text-[#6b675f]">{item.unit}</span>
                                        {!isDefault && (
                                          <button
                                            onClick={() => setDeadlineModalWindowOverrides(prev => { const n = { ...prev }; delete n[item.title]; return n })}
                                            className="text-[10px] text-[#9b9b9b] hover:text-[#3d3d3d] underline ml-0.5"
                                          >
                                            reset
                                          </button>
                                        )}
                                      </div>
                                      {calcDateDisplay && (
                                        <span className="text-[11px] text-[#9b9b9b]">→ {calcDateDisplay}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[#f0f0f0] flex-shrink-0">
                      <Button onClick={resetDeadlineModal} className="h-8 px-4 bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] text-[12px] rounded-sm font-medium">Cancel</Button>
                      <Button
                        onClick={handleAddDeadline}
                        disabled={checkedCount === 0}
                        className="h-8 px-4 bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-[12px] rounded-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Add {checkedCount > 0 ? checkedCount : ""} deadline{checkedCount !== 1 ? "s" : ""}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </div>
    )
  }

  // Estates List View
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Dark Header Bar */}
      <header className="bg-[#3d3d3d] text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-1 hover:bg-[#4d4d4d] rounded transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm sm:text-base font-semibold">Estates</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs text-gray-400 hidden md:inline">release/2025-12-30#2 | 44fecdd</span>
          <button className="p-1 hover:bg-[#4d4d4d] rounded transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="p-1 hover:bg-[#4d4d4d] rounded transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-30 w-64 bg-[#d8d4ce] flex flex-col border-r border-[#c0bcb6] transition-transform duration-300 h-full`}>
          <nav className="flex-1 p-2 space-y-0.5">
            <button
              onClick={() => { setActiveNav("home"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                activeNav === "home" 
                  ? "bg-[#ececec] text-[#3d3d3d]" 
                  : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
              }`}
              title="Home"
            >
              <Home className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="text-[13px] whitespace-nowrap">Home</span>
            </button>
            <button
              onClick={() => { setActiveNav("jobs"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                activeNav === "jobs" 
                  ? "bg-[#ececec] text-[#3d3d3d]" 
                  : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
              }`}
              title="My Jobs"
            >
              <Briefcase className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="text-[13px] whitespace-nowrap">My Jobs</span>
            </button>
            <button
              onClick={() => { setActiveNav("add"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                activeNav === "add" 
                  ? "bg-[#ececec] text-[#3d3d3d]" 
                  : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
              }`}
              title="Add Estate"
            >
              <FileText className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="text-[13px] whitespace-nowrap">Add Estate</span>
            </button>
            <button
              onClick={() => { setActiveNav("deleted"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                activeNav === "deleted" 
                  ? "bg-[#ececec] text-[#3d3d3d]" 
                  : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
              }`}
              title="Manage Deleted Estates"
            >
              <Trash2 className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="text-[13px] whitespace-nowrap">Manage Deleted Estates</span>
            </button>
            <button
              onClick={() => { setActiveNav("users"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                activeNav === "users" 
                  ? "bg-[#ececec] text-[#3d3d3d]" 
                  : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
              }`}
              title="Manage Care Team Users"
            >
              <Users className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="text-[13px] whitespace-nowrap">Manage Care Team Users</span>
            </button>
            <button
              onClick={() => { setActiveNav("institutions"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                activeNav === "institutions" 
                  ? "bg-[#ececec] text-[#3d3d3d]" 
                  : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
              }`}
              title="Manage Institutions"
            >
              <Building2 className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="text-[13px] whitespace-nowrap">Manage Institutions</span>
            </button>
            <button
              onClick={() => { setActiveNav("document-vault"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
                activeNav === "document-vault" 
                  ? "bg-[#ececec] text-[#3d3d3d]" 
                  : "text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
              }`}
              title="Document Vault"
            >
              <FolderOpen className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="text-[13px] whitespace-nowrap">Document Vault</span>
            </button>
            <hr className="border-[#c0bcb6] my-1.5 mx-2" />
            <a
              href="/probate-research"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors text-[#6b675f] hover:bg-[#ececec] hover:text-[#3d3d3d]"
              title="Probate Research"
            >
              <Map className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="text-[13px] whitespace-nowrap">Probate Research</span>
              <span className="ml-auto text-[9px] font-semibold text-[#7c6fc4] bg-purple-50 border border-purple-200 rounded px-1 py-0.5 leading-tight">NEW</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#f8f7f5]">
          {activeNav === "document-vault" ? (
            // Document Vault View
            <>
              {/* Vault Header */}
              <div className="bg-white border-b border-[#e5e5e5] px-6 py-4">
                <div className="flex items-center gap-2 mb-4">
                  {vaultFolder && (
                    <>
                      <button
                        onClick={() => setVaultFolder(null)}
                        className="text-[#6b675f] hover:text-[#3d3d3d] text-sm"
                      >
                        Document Vault
                      </button>
                      <ChevronRight className="w-4 h-4 text-[#6b675f]" />
                    </>
                  )}
                  <h2 className="text-lg font-semibold text-[#3d3d3d]">
                    {vaultFolder || "Document Vault"}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Search document vault"
                      className="w-full h-9 text-sm bg-white border-[#d0d0d0] text-[#3d3d3d] placeholder:text-[#9b9b9b]"
                    />
                  </div>
                </div>
              </div>

              {/* Vault Content */}
              <div className="flex-1 overflow-auto p-6">
                {!vaultFolder ? (
                  // Root level folders
                  <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#f8f7f5] border-b border-[#e5e5e5]">
                        <tr>
                          <th className="text-left px-6 py-3 text-[#3d3d3d] font-semibold text-sm">Name</th>
                          <th className="text-left px-6 py-3 text-[#3d3d3d] font-semibold text-sm">Modified</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr 
                          className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors cursor-pointer"
                          onClick={() => setVaultFolder("Customer Estates")}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Folder className="w-5 h-5 text-[#6b675f] flex-shrink-0" />
                              <span className="text-[#3d3d3d] text-sm font-medium">Customer Estates</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#6b675f] text-sm">Recently updated</td>
                        </tr>
                        <tr className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Folder className="w-5 h-5 text-[#6b675f] flex-shrink-0" />
                              <span className="text-[#3d3d3d] text-sm font-medium">Probate Research</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#6b675f] text-sm">Mon Nov 4 2024</td>
                        </tr>
                        <tr className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Folder className="w-5 h-5 text-[#6b675f] flex-shrink-0" />
                              <span className="text-[#3d3d3d] text-sm font-medium">Settlement Processes</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#6b675f] text-sm">Mon Nov 4 2024</td>
                        </tr>
                        <tr className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Trash2 className="w-5 h-5 text-[#6b675f] flex-shrink-0" />
                              <span className="text-[#3d3d3d] text-sm font-medium">Recently Deleted</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#6b675f] text-sm">—</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : vaultFolder === "Customer Estates" ? (
                  // Customer Estates - Show all estates in folder format
                  <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#f8f7f5] border-b border-[#e5e5e5]">
                        <tr>
                          <th className="text-left px-6 py-3 text-[#3d3d3d] font-semibold text-sm">Name</th>
                          <th className="text-left px-6 py-3 text-[#3d3d3d] font-semibold text-sm">Size</th>
                          <th className="text-left px-6 py-3 text-[#3d3d3d] font-semibold text-sm">Modified</th>
                          <th className="text-right px-6 py-3 text-[#3d3d3d] font-semibold text-sm w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estates.map((estate) => (
                          <tr 
                            key={estate.id}
                            className={`border-b border-[#f0f0f0] transition-colors ${estate.highlight ? "bg-red-100 hover:bg-red-200" : "hover:bg-[#fafafa]"}`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Folder className="w-5 h-5 text-[#6b675f] flex-shrink-0" />
                                <span 
                                  className="text-[#3d3d3d] text-sm font-medium cursor-pointer"
                                  onClick={() => setSelectedEstate(estate)}
                                >
                                  Estate of {estate.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[#6b675f] text-sm">—</td>
                            <td className="px-6 py-4 text-[#6b675f] text-sm">{estate.createdAt} by {estate.assignedTo !== "None assigned" ? estate.assignedTo : "Alix"}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setSelectedEstate(estate)}
                                  className="p-1.5 text-[#6b675f] hover:bg-[#e5e5e5] rounded transition-colors"
                                  title="Edit estate"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-1.5 text-[#6b675f] hover:bg-[#fee] hover:text-red-600 rounded transition-colors"
                                  title="Delete estate"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            // Original Estates List View
            <>
              {/* Filter Bar */}
          <div className="bg-white border-b border-[#e5e5e5] px-6 py-3">
            <div className="flex items-center gap-3">
              <Input
                type="text"
                placeholder="Estate Search"
                className="w-64 h-9 text-sm bg-white border-[#d0d0d0] text-[#3d3d3d] placeholder:text-[#9b9b9b]"
              />
              <select className="h-9 px-3 py-1.5 bg-white border border-[#d0d0d0] rounded-md text-[#6b675f] text-sm">
                <option>Assigned To</option>
              </select>
              <select className="h-9 px-3 py-1.5 bg-white border border-[#d0d0d0] rounded-md text-[#6b675f] text-sm">
                <option>Status</option>
              </select>
              <label className="flex items-center gap-2 text-[#3d3d3d] text-[13px]">
                <input
                  type="checkbox"
                  checked={displayTestEstates}
                  onChange={(e) => setDisplayTestEstates(e.target.checked)}
                  className="rounded"
                />
                Display test estates
              </label>
              <Button variant="outline" className="border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] bg-white ml-auto text-sm h-9">
                <Download className="w-4 h-4 mr-1.5" />
                Export Financial Report
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <div className="min-w-[800px]">
              <table className="w-full">
              <thead className="bg-[#ebe9e6] sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">Estate ID</th>
                  <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">Name</th>
                  <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">Executors</th>
                  <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">Status</th>
                  <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">Type</th>
                  <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">Created At</th>
                  <th className="text-left px-4 py-2.5 text-[#3d3d3d] font-medium text-[13px]">Assigned</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {estates.map((estate, index) => (
                  <tr 
                    key={estate.id} 
                    className={`border-b border-[#f0f0f0] cursor-pointer ${estate.highlight ? "bg-red-100 hover:bg-red-200" : "hover:bg-[#fafafa]"}`}
                    onClick={() => setSelectedEstate(estate)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          className="text-[#6b675f] text-[13px] underline hover:text-[#3d3d3d]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEstate(estate);
                          }}
                        >
                          {estate.shortId}
                        </button>
                        <button 
                          className="text-[#6b675f] hover:text-[#3d3d3d]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#3d3d3d] text-[13px]">{estate.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {estate.executors.map((executor) => (
                          <span key={executor} className="px-2 py-0.5 bg-[#ebe9e6] text-[#3d3d3d] text-[12px] rounded">
                            {executor}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#3d3d3d] text-[13px]">{estate.status}</td>
                    <td className="px-4 py-3">
                      <svg
                        className="w-4 h-4 text-[#3d3d3d]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </td>
                    <td className="px-4 py-3 text-[#3d3d3d] text-[13px]">{estate.createdAt}</td>
                    <td className="px-4 py-3 text-[#6b675f] text-[13px]">{estate.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
            </>
          )}
        </main>

        {/* Right Side Agent Text */}
        <div className="flex items-center justify-center bg-[#2d2d2d] px-2">
          <div className="writing-mode-vertical-rl rotate-180 text-white font-semibold tracking-widest text-sm">
            AI AGENT
          </div>
        </div>
      </div>

      {/* Add Milestone Modal */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5]">
              <h2 className="text-lg font-semibold text-[#3d3d3d]">Add Milestone</h2>
              <button
                onClick={() => {
                  setShowAddMilestoneModal(false)
                  setNewMilestoneName("")
                  setNewMilestoneDate("")
                  setNewMilestoneDescription("")
                }}
                className="p-2 hover:bg-[#f8f7f5] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#6b675f]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-[#3d3d3d] mb-1.5">
                  Name <span className="text-red-600">*</span>
                </label>
                <select
                  value={newMilestoneName}
                  onChange={(e) => setNewMilestoneName(e.target.value)}
                  className="w-full h-9 px-3 py-1.5 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d] focus:border-transparent"
                >
                  <option value="">Select a milestone...</option>
                  <option value="Closed WON">Closed WON</option>
                  <option value="K.Y.C.">K.Y.C.</option>
                  <option value="Determine Legal Path">Determine Legal Path</option>
                  <option value="File for Authority">File for Authority</option>
                  <option value="Initial Court Date">Initial Court Date</option>
                  <option value="Authority Granted">Authority Granted</option>
                  <option value="Establish Operating Bank Account">Establish Operating Bank Account</option>
                  <option value="File Distribution Order">File Distribution Order</option>
                  <option value="File Tax Return">File Tax Return</option>
                  <option value="File To Close">File To Close</option>
                  <option value="Estate Closed">Estate Closed</option>
                </select>
              </div>

              {/* Date Field */}
              <div>
                <label className="block text-sm font-medium text-[#3d3d3d] mb-1.5">
                  Date <span className="text-red-600">*</span>
                </label>
                <Input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="w-full h-9 text-sm bg-white border-[#d0d0d0] text-[#3d3d3d]"
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-[#3d3d3d] mb-1.5">
                  Description
                </label>
                <textarea
                  value={newMilestoneDescription}
                  onChange={(e) => setNewMilestoneDescription(e.target.value)}
                  placeholder="Enter milestone details..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#d0d0d0] rounded-md text-[#3d3d3d] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#3d3d3d] focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e5e5] bg-[#fafafa]">
              <Button
                onClick={() => {
                  setShowAddMilestoneModal(false)
                  setNewMilestoneName("")
                  setNewMilestoneDate("")
                  setNewMilestoneDescription("")
                }}
                className="bg-white border border-[#d0d0d0] text-[#3d3d3d] hover:bg-[#f8f7f5] text-sm h-9"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMilestone}
                className="bg-[#3d3d3d] text-white hover:bg-[#2d2d2d] text-sm h-9"
              >
                Save Milestone
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
