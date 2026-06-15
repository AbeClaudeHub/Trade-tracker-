import { RequireAuth } from "@/components/auth/RequireAuth";
import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";

export default function AssessmentPage() {
  return (
    <RequireAuth>
      <AssessmentFlow />
    </RequireAuth>
  );
}
