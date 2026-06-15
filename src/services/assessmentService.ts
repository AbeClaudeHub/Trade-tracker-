import {
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { AssessmentResponses, AssessmentResult } from "@/domain/types";
import { scoreAssessment } from "@/domain/assessment/scoring";
import { resolveArchetype } from "@/domain/archetypes/engine";
import { paths } from "./collections";

/**
 * Score and persist a completed assessment, and update the user's profile with
 * their resolved archetype. Returns the stored result.
 */
export async function submitAssessment(
  uid: string,
  responses: AssessmentResponses,
): Promise<AssessmentResult> {
  const dimensionScores = scoreAssessment(responses);
  const { primary, secondary } = resolveArchetype(dimensionScores);

  const id = `assessment-${Date.now()}`;
  const result: AssessmentResult = {
    id,
    userId: uid,
    completedAt: new Date().toISOString(),
    responses,
    dimensionScores,
    archetypeId: primary,
    secondaryArchetypeId: secondary,
  };

  await setDoc(paths.assessment(uid, id), result);

  // The first assessment also sets the immutable baseline archetype — the
  // "starting line" against which Identity Evolution measures progress.
  const snap = await getDoc(paths.user(uid));
  const hasBaseline = snap.exists() && snap.data().baselineArchetypeId;
  await updateDoc(paths.user(uid), {
    assessmentCompleted: true,
    archetypeId: primary,
    ...(hasBaseline ? {} : { baselineArchetypeId: primary }),
  });

  return result;
}

/** Fetch the most recent assessment result for a user, if any. */
export async function getLatestAssessment(
  uid: string,
): Promise<AssessmentResult | null> {
  const q = query(paths.assessments(uid), orderBy("completedAt", "desc"), limit(1));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  return first ? (first.data() as AssessmentResult) : null;
}

/** Persist an AI interpretation onto an existing assessment. */
export async function saveInterpretation(
  uid: string,
  assessmentId: string,
  interpretation: string,
): Promise<void> {
  await updateDoc(paths.assessment(uid, assessmentId), { interpretation });
}

export async function getAssessment(
  uid: string,
  id: string,
): Promise<AssessmentResult | null> {
  const snap = await getDoc(paths.assessment(uid, id));
  return snap.exists() ? (snap.data() as AssessmentResult) : null;
}
