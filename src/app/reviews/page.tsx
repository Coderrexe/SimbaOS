import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Panel } from "@/components/command/Panel";

async function getReviewsData(userId: string) {
  const reviews = await prisma.weeklyReview.findMany({
    where: { userId },
    orderBy: { weekStart: "desc" },
    take: 10,
  });

  return { reviews };
}

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { reviews } = await getReviewsData(session.user.id);

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Weekly Reviews</h1>
          <p className="text-muted">Reflect on your progress and plan ahead</p>
        </div>

        <Panel title="Recent Reviews">
          {reviews.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <p className="mb-4">No weekly reviews yet</p>
              <p className="text-sm text-subtle">
                Weekly reviews help you reflect and improve
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-[var(--radius-lg)] surface-2"
                >
                  <h3 className="text-sm font-semibold mb-3">
                    Week of {new Date(review.weekStart).toLocaleDateString()}
                  </h3>

                  {review.wins.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs text-muted mb-1">Wins</h4>
                      <ul className="text-sm space-y-1">
                        {review.wins.map((win, i) => (
                          <li key={i}>✓ {win}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {review.lessons.length > 0 && (
                    <div>
                      <h4 className="text-xs text-muted mb-1">Lessons</h4>
                      <ul className="text-sm space-y-1">
                        {review.lessons.map((lesson, i) => (
                          <li key={i}>💡 {lesson}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
