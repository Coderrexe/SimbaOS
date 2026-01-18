import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Panel } from "@/components/command/Panel";
import { BookOpen } from "lucide-react";

export default async function LearningPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Learning</h1>
          <p className="text-muted">Track your learning goals and progress</p>
        </div>

        <Panel>
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted" />
            <h3 className="text-lg font-semibold mb-2">Learning Tracker</h3>
            <p className="text-muted mb-6">
              Manage courses, books, skills, and knowledge acquisition
            </p>
            <p className="text-sm text-subtle">
              This feature is coming soon. Use Goals to track learning
              objectives.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
