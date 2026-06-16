import { getDoc, setDoc, updateDoc } from "firebase/firestore";
import type { AssessmentResponses, Report } from "@/domain/types";
import { generateReport } from "@/domain/report/generate";
import { isDemoMode } from "@/lib/demo/isDemo";
import { demo } from "@/lib/demo/store";
import { paths } from "./collections";

/**
 * Generate the report from assessment responses and persist it as the user's
 * single artifact. Also stamps the resolved archetype onto the profile.
 */
export async function generateAndSaveReport(
  uid: string,
  responses: AssessmentResponses,
): Promise<Report> {
  const report = generateReport(uid, responses);

  // Capture progress vs the previous assessment, if any.
  const previous = await getReport(uid);
  if (previous) {
    report.previousDisciplineScore = previous.disciplineScore ?? null;
    report.previousArchetypeId = previous.archetypeId ?? null;
  }

  if (isDemoMode()) {
    demo().report = report;
    demo().profile.archetypeId = report.archetypeId;
    return report;
  }

  await setDoc(paths.report(uid), report);
  const snap = await getDoc(paths.user(uid));
  const hasBaseline = snap.exists() && snap.data().baselineArchetypeId;
  await updateDoc(paths.user(uid), {
    assessmentCompleted: true,
    archetypeId: report.archetypeId,
    ...(hasBaseline ? {} : { baselineArchetypeId: report.archetypeId }),
  });
  return report;
}

export async function getReport(uid: string): Promise<Report | null> {
  if (isDemoMode()) return demo().report;
  const snap = await getDoc(paths.report(uid));
  return snap.exists() ? (snap.data() as Report) : null;
}

/** Persist AI narrative onto the stored report. */
export async function saveReportNarrative(
  uid: string,
  ai: NonNullable<Report["ai"]>,
): Promise<void> {
  if (isDemoMode()) {
    if (demo().report) demo().report.ai = ai;
    return;
  }
  await updateDoc(paths.report(uid), { ai });
}
