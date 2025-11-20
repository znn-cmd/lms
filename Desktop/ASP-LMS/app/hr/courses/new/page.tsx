'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HrLayout from '@/components/HrLayout';

interface Lesson {
  title: string;
  content: string;
  order: number;
}

interface Question {
  text: string;
  options: string[];
  correctOptionIndex: number;
  weight: number;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Course info
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');

  // Step 2: Lessons
  const [lessons, setLessons] = useState<Lesson[]>([
    { title: '', content: '', order: 1 },
  ]);

  // Step 3: Quiz
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      weight: 10,
    },
  ]);

  const [courseId, setCourseId] = useState<string | null>(null);

  const handleCreateCourse = async () => {
    if (!courseTitle || !courseDescription) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/hr/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: courseTitle,
          description: courseDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка создания курса');
        setLoading(false);
        return;
      }

      setCourseId(data.course.id);
      setStep(2);
      setLoading(false);
    } catch (err) {
      setError('Произошла ошибка при создании курса');
      setLoading(false);
    }
  };

  const handleAddLesson = () => {
    setLessons([
      ...lessons,
      { title: '', content: '', order: lessons.length + 1 },
    ]);
  };

  const handleUpdateLesson = (index: number, field: keyof Lesson, value: string | number) => {
    const updated = [...lessons];
    updated[index] = { ...updated[index], [field]: value };
    setLessons(updated);
  };

  const handleRemoveLesson = (index: number) => {
    if (lessons.length > 1) {
      const updated = lessons.filter((_, i) => i !== index);
      updated.forEach((lesson, i) => {
        lesson.order = i + 1;
      });
      setLessons(updated);
    }
  };

  const handleSaveLessons = async () => {
    if (lessons.some((l) => !l.title || !l.content)) {
      setError('Заполните все поля уроков');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/hr/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка сохранения уроков');
        setLoading(false);
        return;
      }

      setStep(3);
      setLoading(false);
    } catch (err) {
      setError('Произошла ошибка при сохранении уроков');
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        weight: 10,
      },
    ]);
  };

  const handleUpdateQuestion = (
    index: number,
    field: keyof Question,
    value: string | number | string[]
  ) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleUpdateQuestionOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle || !quizDescription) {
      setError('Заполните название и описание теста');
      return;
    }

    if (questions.some((q) => !q.text || q.options.some((o) => !o))) {
      setError('Заполните все поля вопросов');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/hr/courses/${courseId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizTitle,
          description: quizDescription,
          questions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка сохранения теста');
        setLoading(false);
        return;
      }

      router.push('/hr/courses');
    } catch (err) {
      setError('Произошла ошибка при сохранении теста');
      setLoading(false);
    }
  };

  return (
    <HrLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Создание нового курса</h1>
          <div className="mt-4 flex items-center space-x-4">
            <div
              className={`flex items-center ${
                step >= 1 ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`}
              >
                1
              </div>
              <span className="ml-2">Информация о курсе</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div
              className={`flex items-center ${
                step >= 2 ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`}
              >
                2
              </div>
              <span className="ml-2">Уроки</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div
              className={`flex items-center ${
                step >= 3 ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`}
              >
                3
              </div>
              <span className="ml-2">Тест</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">Информация о курсе</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название курса
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Введите название курса"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание курса
              </label>
              <textarea
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Введите описание курса"
              />
            </div>
            <button
              onClick={handleCreateCourse}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать курс и перейти к урокам'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Уроки курса</h2>
              <button
                onClick={handleAddLesson}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Добавить урок
              </button>
            </div>
            {lessons.map((lesson, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Урок {lesson.order}</h3>
                  {lessons.length > 1 && (
                    <button
                      onClick={() => handleRemoveLesson(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Удалить
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название урока
                  </label>
                  <input
                    type="text"
                    value={lesson.title}
                    onChange={(e) =>
                      handleUpdateLesson(index, 'title', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Введите название урока"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Содержание урока
                  </label>
                  <textarea
                    value={lesson.content}
                    onChange={(e) =>
                      handleUpdateLesson(index, 'content', e.target.value)
                    }
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Введите содержание урока"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={handleSaveLessons}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить уроки и перейти к тесту'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">Создание теста</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название теста
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Введите название теста"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание теста
              </label>
              <textarea
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Введите описание теста"
              />
            </div>

            <div className="flex justify-between items-center mt-6">
              <h3 className="text-lg font-semibold">Вопросы</h3>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Добавить вопрос
              </button>
            </div>

            {questions.map((question, qIndex) => (
              <div key={qIndex} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Вопрос {qIndex + 1}</h4>
                  {questions.length > 1 && (
                    <button
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Удалить
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Текст вопроса
                  </label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) =>
                      handleUpdateQuestion(qIndex, 'text', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Введите текст вопроса"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Варианты ответов
                  </label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="mb-2 flex items-center">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctOptionIndex === oIndex}
                        onChange={() =>
                          handleUpdateQuestion(qIndex, 'correctOptionIndex', oIndex)
                        }
                        className="mr-2"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleUpdateQuestionOption(qIndex, oIndex, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={`Вариант ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Вес вопроса (баллы)
                  </label>
                  <input
                    type="number"
                    value={question.weight}
                    onChange={(e) =>
                      handleUpdateQuestion(qIndex, 'weight', parseInt(e.target.value) || 10)
                    }
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleSaveQuiz}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить тест и завершить'}
            </button>
          </div>
        )}
      </div>
    </HrLayout>
  );
}

