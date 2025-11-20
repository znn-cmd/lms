import { prisma } from "./prisma"

export async function getKanbanStats() {
  const candidates = await prisma.candidateProfile.findMany({
    include: {
      tests: {
        include: {
          test: {
            select: {
              passingScore: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      courses: {
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
  })

  // Helper function to get candidates for each column (same logic as kanban)
  const getNewCandidates = () => {
    const usedIds = new Set<string>()
    candidates.forEach((c) => {
      if (!["REGISTERED", "PROFILE_COMPLETED"].includes(c.status)) {
        usedIds.add(c.id)
      }
    })
    return candidates.filter((c) => {
      if (usedIds.has(c.id)) return false
      return ["REGISTERED", "PROFILE_COMPLETED"].includes(c.status)
    }).length
  }

  const getStartedLearning = () => {
    const usedIds = new Set<string>()
    candidates.forEach((c) => {
      if (!["REGISTERED", "PROFILE_COMPLETED", "IN_COURSE"].includes(c.status)) {
        usedIds.add(c.id)
      } else {
        const course = c.courses[0]
        if (course && course.progress >= 50) {
          usedIds.add(c.id)
        }
      }
    })
    return candidates.filter((c) => {
      if (usedIds.has(c.id)) return false
      if (c.status !== "IN_COURSE") return false
      const course = c.courses[0]
      return course && course.progress < 50
    }).length
  }

  const getInTraining = () => {
    const usedIds = new Set<string>()
    candidates.forEach((c) => {
      if (!["REGISTERED", "PROFILE_COMPLETED", "IN_COURSE"].includes(c.status)) {
        usedIds.add(c.id)
      } else if (c.status === "IN_COURSE") {
        const course = c.courses[0]
        if (!course || course.progress < 50) {
          usedIds.add(c.id)
        }
      }
    })
    return candidates.filter((c) => {
      if (usedIds.has(c.id)) return false
      if (c.status !== "IN_COURSE") return false
      const course = c.courses[0]
      return course && course.progress >= 50 && course.progress < 100
    }).length
  }

  const getStartedTest = () => {
    const usedIds = new Set<string>()
    candidates.forEach((c) => {
      if (["OFFER_ACCEPTED", "HIRED", "OFFER_DECLINED", "REJECTED"].includes(c.status)) {
        usedIds.add(c.id)
      }
      const test = c.tests[0]
      if (
        test &&
        test.score !== null &&
        ((test.score >= test.test.passingScore && test.status === "completed") ||
          (test.score < test.test.passingScore && test.status === "completed"))
      ) {
        usedIds.add(c.id)
      }
    })
    return candidates.filter((c) => {
      if (usedIds.has(c.id)) return false
      if (c.status !== "TEST_COMPLETED" && c.status !== "OFFER_SENT") return false
      const test = c.tests[0]
      return test && (test.status === "in_progress" || test.status === "pending_review" || test.score === null)
    }).length
  }

  const getTestPassed = () => {
    const usedIds = new Set<string>()
    candidates.forEach((c) => {
      if (["OFFER_ACCEPTED", "HIRED", "OFFER_DECLINED", "REJECTED"].includes(c.status)) {
        usedIds.add(c.id)
      }
      const test = c.tests[0]
      if (
        test &&
        test.score !== null &&
        test.score < test.test.passingScore &&
        test.status === "completed"
      ) {
        usedIds.add(c.id)
      }
    })
    return candidates.filter((c) => {
      if (usedIds.has(c.id)) return false
      if (c.status !== "OFFER_SENT" && c.status !== "TEST_COMPLETED") return false
      const test = c.tests[0]
      return (
        test &&
        test.score !== null &&
        test.score >= test.test.passingScore &&
        test.status === "completed"
      )
    }).length
  }

  const getOfferAccepted = () => {
    return candidates.filter((c) => ["OFFER_ACCEPTED", "HIRED"].includes(c.status)).length
  }

  const getTestFailed = () => {
    const usedIds = new Set<string>()
    candidates.forEach((c) => {
      if (["OFFER_ACCEPTED", "HIRED", "OFFER_DECLINED"].includes(c.status)) {
        usedIds.add(c.id)
      }
      const test = c.tests[0]
      if (
        test &&
        test.score !== null &&
        test.score >= test.test.passingScore &&
        test.status === "completed"
      ) {
        usedIds.add(c.id)
      }
    })
    return candidates.filter((c) => {
      if (usedIds.has(c.id)) return false
      if (c.status === "REJECTED") return true
      if (c.status !== "TEST_COMPLETED") return false
      const test = c.tests[0]
      return (
        test &&
        test.score !== null &&
        test.score < test.test.passingScore &&
        test.status === "completed"
      )
    }).length
  }

  const getOfferDeclined = () => {
    return candidates.filter((c) => c.status === "OFFER_DECLINED").length
  }

  return {
    newCandidate: getNewCandidates(),
    startedLearning: getStartedLearning(),
    inTraining: getInTraining(),
    startedTest: getStartedTest(),
    testPassed: getTestPassed(),
    offerAccepted: getOfferAccepted(),
    testFailed: getTestFailed(),
    offerDeclined: getOfferDeclined(),
  }
}

