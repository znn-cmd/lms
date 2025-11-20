'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/StudentLayout';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  weight: number;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function QuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/student/quiz')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setQuiz(data.quiz);
          // Инициализация ответов
          const initialAnswers: Record<string, number> = {};
          data.quiz.questions.forEach((q: Question) => {
            initialAnswers[q.id] = -1;
          });
          setAnswers(initialAnswers);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки теста');
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/student/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz?.id,
          answers: Object.entries(answers).map(([questionId, optionIndex]) => ({
            questionId,
            optionIndex,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка отправки ответов');
        setSubmitting(false);
        return;
      }

      router.push('/student/result');
    } catch (err) {
      setError('Произошла ошибка при отправке ответов');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <div className="text-lg">Загрузка теста...</div>
        </div>
      </StudentLayout>
    );
  }

  if (error && !quiz) {
    return (
      <StudentLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </StudentLayout>
    );
  }

  if (!quiz) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <div className="text-lg">Тест не найден</div>
        </div>
      </StudentLayout>
    );
  }

  const allAnswered = Object.values(answers).every((a) => a !== -1);

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-600 mt-2">{quiz.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {quiz.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Вопрос {index + 1}: {question.text}
              </h3>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={optionIndex}
                      checked={answers[question.id] === optionIndex}
                      onChange={() =>
                        setAnswers({ ...answers, [question.id]: optionIndex })
                      }
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Отвечено: {Object.values(answers).filter((a) => a !== -1).length} из{' '}
                {quiz.questions.length}
              </p>
              <button
                type="submit"
                disabled={!allAnswered || submitting}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Отправка...' : 'Отправить ответы'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
}

