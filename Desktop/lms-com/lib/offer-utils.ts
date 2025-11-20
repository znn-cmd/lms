import { prisma } from "./prisma"
import { CandidateStatus } from "@prisma/client"

export async function createOfferForCandidate(candidateId: string, testId?: string) {
  try {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: {
        user: {
          select: {
            name: true,
            surname: true,
            id: true,
          },
        },
        currentVacancy: true,
        offers: {
          where: {
            status: "sent",
            type: "personal",
          },
        },
      },
    })

    if (!candidate || !candidate.currentVacancy) {
      return null
    }

    // Don't create duplicate personal offers
    if (candidate.offers.length > 0) {
      return null
    }

    // Check if there's a general offer linked to this test and vacancy
    let generalOffer = null
    if (testId) {
      generalOffer = await prisma.offer.findFirst({
        where: {
          type: "general",
          testId: testId,
          vacancyId: candidate.currentVacancy.id,
        },
        include: {
          template: true,
        },
      })
    }

    // If there's a general offer, create a personal offer from it
    if (generalOffer) {
      // Create personal offer from general offer
      const offer = await prisma.offer.create({
        data: {
          type: "personal",
          candidateId: candidate.id,
          vacancyId: null,
          testId: null,
          templateId: generalOffer.templateId,
          content: generalOffer.content,
          contentRu: generalOffer.contentRu,
          status: "sent",
        },
      })

      await prisma.candidateProfile.update({
        where: { id: candidate.id },
        data: {
          status: CandidateStatus.OFFER_SENT,
        },
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: candidate.userId,
          title: "New Job Offer",
          message: `You have received a job offer for ${candidate.currentVacancy.title}`,
          type: "success",
          channel: "INTERNAL",
          relatedId: offer.id,
          relatedType: "offer",
        },
      })

      return offer
    }

    // Otherwise, create default offer
    let offerTemplate = null

    // Use offer template from test if available, otherwise get default template
    const template = offerTemplate || await prisma.offerTemplate.findFirst({
      where: { isActive: true },
    })

    let content = ""
    let contentRu: string | null = null

    if (template) {
      // Render template with variables
      content = template.content
      contentRu = template.contentRu

      const variables: Record<string, string> = {
        candidateName: `${candidate.user.name} ${candidate.user.surname}`,
        vacancyTitle: candidate.currentVacancy.title,
        commission: "10", // Default, can be customized
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
        location: candidate.city || "TBD",
      }

      // Replace variables in content
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, "g")
        content = content.replace(regex, value)
        if (contentRu) {
          contentRu = contentRu.replace(regex, value)
        }
      }
    } else {
      // Create offer without template
      content = `Dear ${candidate.user.name} ${candidate.user.surname},

We are pleased to offer you the position of ${candidate.currentVacancy.title}.

Congratulations on successfully completing the course and test!

We look forward to welcoming you to our team.

Best regards,
HR Team`
    }

    const offer = await prisma.offer.create({
      data: {
        candidateId: candidate.id,
        vacancyId: candidate.currentVacancy.id,
        testId: testId || null,
        templateId: template?.id || null,
        content,
        contentRu: contentRu || null,
        status: "sent",
      },
    })

    await prisma.candidateProfile.update({
      where: { id: candidate.id },
      data: {
        status: CandidateStatus.OFFER_SENT,
      },
    })

    // Create notification for candidate
    await prisma.notification.create({
      data: {
        userId: candidate.user.id,
        title: "New Job Offer",
        message: `You have received a job offer for ${candidate.currentVacancy.title}`,
        type: "success",
        channel: "INTERNAL",
        relatedId: offer.id,
        relatedType: "offer",
      },
    })

    return offer
  } catch (error) {
    console.error("Error creating offer:", error)
    return null
  }
}

