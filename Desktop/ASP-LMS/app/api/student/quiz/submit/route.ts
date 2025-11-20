import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);

  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { quizId, answers } = await request.json();

    if (!quizId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Получаем вопросы теста
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Подсчитываем баллы
    let totalScore = 0;
    const answerMap = new Map(
      answers.map((a: { questionId: string; optionIndex: number }) => [
        a.questionId,
        a.optionIndex,
      ])
    );

    quiz.questions.forEach((question) => {
      const userAnswer = answerMap.get(question.id);
      if (userAnswer === question.correctOptionIndex) {
        totalScore += question.weight;
      }
    });

    // Ограничиваем максимум 100
    const finalScore = Math.min(totalScore, 100);

    // Определяем статус
    let newStatus: string;
    let offerStatus: string = 'NONE';

    if (finalScore < 50) {
      newStatus = 'REJECTED';
    } else if (finalScore < 75) {
      newStatus = 'OFFER_TRAINEE';
      offerStatus = 'SENT';
    } else {
      newStatus = 'OFFER_REALTOR';
      offerStatus = 'SENT';
    }

    // Создаём попытку
    await prisma.attempt.create({
      data: {
        userId: user.id,
        quizId: quizId,
        answers: JSON.stringify(answers),
        score: finalScore,
        status: 'COMPLETED',
      },
    });

    // Обновляем пользователя
    await prisma.user.update({
      where: { id: user.id },
      data: {
        score: finalScore,
        status: newStatus as any,
        offerStatus: offerStatus as any,
      },
    });

    return NextResponse.json({ success: true, score: finalScore });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

