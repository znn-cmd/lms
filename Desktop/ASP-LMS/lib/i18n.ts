export type Locale = 'en' | 'ru';

export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'ru'];

export const translations = {
  en: {
    // Common
    common: {
      welcome: 'Welcome',
      logout: 'Logout',
      login: 'Login',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      yes: 'Yes',
      no: 'No',
      available: 'Available',
    },
    // Auth
    auth: {
      title: 'Login to System',
      subtitle: 'Learning Platform for Real Estate Agency',
      username: 'Username',
      password: 'Password',
      loginButton: 'Sign In',
      loggingIn: 'Signing in...',
      error: 'Login error',
      invalidCredentials: 'Invalid username or password',
      missingCredentials: 'Username and password are required',
      serverError: 'Internal server error',
      demoAccounts: 'Demo Accounts',
      studentAccount: 'Student: user / user',
      hrAccount: 'HR: hr / hr',
    },
    // Student
    student: {
      dashboard: {
        title: 'Welcome, {name}!',
        status: 'Your Status',
        score: 'Score',
        offerStatus: 'Offer Status',
        selectCourse: 'Select Course',
        activeCourse: 'Active Course',
        lessonsCount: 'Lessons',
        quizAvailable: 'Quiz',
        goToLessons: 'Go to Lessons',
        viewResults: 'View Results',
        startCourse: 'Start this Course',
      },
      course: {
        title: 'Course Lessons',
        backToDashboard: '← Back to Dashboard',
        lessons: 'Lessons',
        lessonPreview: 'Lesson {order}: {title}',
        open: 'Open',
        quiz: 'Final Quiz',
        quizDescription: 'After studying all lessons, take the final quiz to test your knowledge.',
        goToQuiz: 'Go to Quiz',
      },
      lesson: {
        backToLessons: '← Back to Lesson List',
        previousLesson: '← Previous Lesson',
        nextLesson: 'Next Lesson →',
        backToCourse: 'Back to Course',
      },
      quiz: {
        title: 'Quiz',
        description: 'Answer all questions to complete the quiz',
        question: 'Question {number}',
        answered: 'Answered',
        of: 'of',
        submitAnswers: 'Submit Answers',
        submitting: 'Submitting...',
        allQuestionsRequired: 'Please answer all questions',
      },
      result: {
        title: 'Test Results',
        yourResult: 'Your Result',
        points: 'points out of 100',
        status: 'Status',
        offer: 'Job Offer',
        acceptOffer: 'Accept Offer',
        declineOffer: 'Decline',
        accepting: 'Accepting...',
        declining: 'Declining...',
        backToDashboard: 'Back to Dashboard',
        congratulations: 'Congratulations! You have been hired!',
        hrContact: 'HR department will contact you to discuss work details.',
      },
      status: {
        NEW: 'New',
        COURSE_IN_PROGRESS: 'In Progress',
        QUIZ_PENDING: 'Quiz Pending',
        QUIZ_COMPLETED: 'Quiz Completed',
        REJECTED: 'Rejected',
        OFFER_TRAINEE: 'Trainee Offer',
        OFFER_REALTOR: 'Realtor Offer',
        OFFER_DECLINED: 'Offer Declined',
        HIRED_TRAINEE: 'Hired as Trainee',
        HIRED_REALTOR: 'Hired as Realtor',
      },
      offerStatus: {
        NONE: '—',
        SENT: 'Sent',
        ACCEPTED: 'Accepted',
        DECLINED: 'Declined',
      },
      offerText: {
        trainee: `Trainee Position Offer:

• Salary: 30,000 RUB + sales commission
• Schedule: Full-time, flexible schedule
• Training: Mentorship from experienced realtors
• Prospects: Opportunity to grow to Realtor position in 3-6 months
• Benefits: Health insurance, corporate events

Terms:
- Working with clients under mentor supervision
- Learning real estate market and properties
- Assisting with viewings and transactions
- Weekly reports and meetings`,
        realtor: `Realtor Position Offer:

• Salary: 50,000 RUB + sales commission (30% to 50% depending on volume)
• Schedule: Full-time, flexible schedule
• Autonomy: Independent work with clients
• Tools: Access to CRM, property database, marketing materials
• Benefits: Health insurance, corporate events, training

Terms:
- Independent work with clients from lead to closing
- Working with real estate properties (apartments, villas, commercial)
- Negotiations and transaction support
- Weekly reports and participation in meetings`,
      },
      statusDescription: {
        REJECTED: 'Unfortunately, at this stage you do not meet the requirements for work in our agency. We recommend additional training and trying again.',
        OFFER_TRAINEE: 'Congratulations! You have passed the selection for the Trainee position. We offer you to start your career in our agency as a Trainee with opportunities for further growth.',
        OFFER_REALTOR: 'Congratulations! You have passed the selection for the Realtor position. We offer you to start working in our agency as a Realtor.',
        OFFER_DECLINED: 'You have declined the job offer. If you change your mind, please contact the HR department.',
      },
    },
    // HR
    hr: {
      dashboard: {
        title: 'Learning Funnel',
        subtitle: 'Overview of candidates by training status',
        candidates: 'Candidates List',
        name: 'Full Name',
        username: 'Username',
        course: 'Course',
        status: 'Status',
        score: 'Score',
        offer: 'Offer',
        actions: 'Actions',
        details: 'Details',
      },
      users: {
        title: 'Candidates',
        backToList: '← Back to Candidates List',
        candidateDetails: 'Candidate: {name}',
        basicInfo: 'Basic Information',
        role: 'Role',
        activeCourse: 'Active Course',
        courseTitle: 'Title',
        lessonsCount: 'Lessons',
        quizAvailable: 'Quiz',
        noCourse: 'No course selected',
        attempts: 'Quiz Attempts',
        courseName: 'Course',
        date: 'Date',
        score: 'Score',
      },
      courses: {
        title: 'Courses',
        subtitle: 'Course Management',
        createNew: 'Create New Course',
        active: 'Active',
        inactive: 'Inactive',
        lessons: 'Lessons',
        quiz: 'Quiz',
        questions: 'questions',
        created: 'Created',
        details: 'Details',
        backToList: '← Back to Course List',
        courseInfo: 'Course Information',
        status: 'Status',
        createdBy: 'Created by',
        lessonsList: 'Lessons ({count})',
        quizTitle: 'Quiz: {title} ({count} questions)',
        questionWeight: 'Question weight: {weight} points',
        correctAnswer: '✓',
      },
      createCourse: {
        title: 'Create New Course',
        step1: 'Course Information',
        step2: 'Lessons',
        step3: 'Quiz',
        courseTitle: 'Course Title',
        courseDescription: 'Course Description',
        createAndContinue: 'Create Course and Continue to Lessons',
        creating: 'Creating...',
        addLesson: 'Add Lesson',
        lessonNumber: 'Lesson {number}',
        lessonTitle: 'Lesson Title',
        lessonContent: 'Lesson Content',
        saveAndContinue: 'Save Lessons and Continue to Quiz',
        saving: 'Saving...',
        quizTitle: 'Quiz Title',
        quizDescription: 'Quiz Description',
        questions: 'Questions',
        addQuestion: 'Add Question',
        questionNumber: 'Question {number}',
        questionText: 'Question Text',
        options: 'Answer Options',
        option: 'Option {number}',
        correctAnswer: 'Correct Answer',
        questionWeight: 'Question Weight (points)',
        saveAndFinish: 'Save Quiz and Finish',
        fillAllFields: 'Please fill in all fields',
      },
      funnel: {
        total: 'Total Candidates',
        NEW: 'New (NEW)',
        COURSE_IN_PROGRESS: 'In Training',
        QUIZ_PENDING: 'Awaiting Quiz',
        QUIZ_COMPLETED: 'Quiz Completed',
        REJECTED: 'Rejected',
        OFFER_TRAINEE: 'Trainee Offer',
        OFFER_REALTOR: 'Realtor Offer',
        OFFER_DECLINED: 'Offer Declined',
        HIRED_TRAINEE: 'Hired as Trainee',
        HIRED_REALTOR: 'Hired as Realtor',
      },
    },
    // Errors
    errors: {
      notFound: '404',
      pageNotFound: 'Page Not Found',
      pageNotFoundDescription: 'The requested page does not exist or has been moved.',
      backToHome: 'Back to Home',
      somethingWentWrong: 'Something went wrong',
      tryAgain: 'Try Again',
      toHome: 'To Home',
    },
  },
  ru: {
    // Common
    common: {
      welcome: 'Добро пожаловать',
      logout: 'Выйти',
      login: 'Войти',
      back: 'Назад',
      next: 'Далее',
      previous: 'Предыдущий',
      submit: 'Отправить',
      cancel: 'Отмена',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Редактировать',
      create: 'Создать',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      yes: 'Да',
      no: 'Нет',
      available: 'Доступен',
    },
    // Auth
    auth: {
      title: 'Вход в систему',
      subtitle: 'Учебная платформа для агентства недвижимости',
      username: 'Имя пользователя',
      password: 'Пароль',
      loginButton: 'Войти',
      loggingIn: 'Вход...',
      error: 'Ошибка входа',
      invalidCredentials: 'Неверное имя пользователя или пароль',
      missingCredentials: 'Имя пользователя и пароль обязательны',
      serverError: 'Внутренняя ошибка сервера',
      demoAccounts: 'Демо-аккаунты',
      studentAccount: 'Ученик: user / user',
      hrAccount: 'HR: hr / hr',
    },
    // Student
    student: {
      dashboard: {
        title: 'Добро пожаловать, {name}!',
        status: 'Ваш статус',
        score: 'Балл',
        offerStatus: 'Статус офера',
        selectCourse: 'Выберите курс',
        activeCourse: 'Активный курс',
        lessonsCount: 'Уроков',
        quizAvailable: 'Тест',
        goToLessons: 'Перейти к урокам',
        viewResults: 'Посмотреть результаты',
        startCourse: 'Начать этот курс',
      },
      course: {
        title: 'Уроки курса',
        backToDashboard: '← Назад к дашборду',
        lessons: 'Уроки',
        lessonPreview: 'Урок {order}: {title}',
        open: 'Открыть',
        quiz: 'Итоговый тест',
        quizDescription: 'После изучения всех уроков пройдите итоговый тест для проверки знаний.',
        goToQuiz: 'Перейти к тесту',
      },
      lesson: {
        backToLessons: '← Назад к списку уроков',
        previousLesson: '← Предыдущий урок',
        nextLesson: 'Следующий урок →',
        backToCourse: 'Вернуться к курсу',
      },
      quiz: {
        title: 'Тест',
        description: 'Ответьте на все вопросы для завершения теста',
        question: 'Вопрос {number}',
        answered: 'Отвечено',
        of: 'из',
        submitAnswers: 'Отправить ответы',
        submitting: 'Отправка...',
        allQuestionsRequired: 'Пожалуйста, ответьте на все вопросы',
      },
      result: {
        title: 'Результаты теста',
        yourResult: 'Ваш результат',
        points: 'баллов из 100',
        status: 'Статус',
        offer: 'Предложение о работе',
        acceptOffer: 'Принять офер',
        declineOffer: 'Отказаться',
        accepting: 'Принятие...',
        declining: 'Отклонение...',
        backToDashboard: 'Вернуться на дашборд',
        congratulations: 'Поздравляем! Вы приняты на работу!',
        hrContact: 'С вами свяжется HR-отдел для обсуждения деталей выхода на работу.',
      },
      status: {
        NEW: 'Новый',
        COURSE_IN_PROGRESS: 'В обучении',
        QUIZ_PENDING: 'Ожидает тест',
        QUIZ_COMPLETED: 'Тест завершён',
        REJECTED: 'Отказ',
        OFFER_TRAINEE: 'Офер стажёр',
        OFFER_REALTOR: 'Офер риэлтор',
        OFFER_DECLINED: 'Офер отклонён',
        HIRED_TRAINEE: 'Нанят как стажёр',
        HIRED_REALTOR: 'Нанят как риэлтор',
      },
      offerStatus: {
        NONE: '—',
        SENT: 'Отправлен',
        ACCEPTED: 'Принят',
        DECLINED: 'Отклонён',
      },
      offerText: {
        trainee: `Офер на позицию стажёра:

• Оклад: 30,000 руб. + комиссия с продаж
• График: полный рабочий день, гибкий график
• Обучение: наставничество от опытных риэлторов
• Перспективы: возможность роста до позиции риэлтора через 3-6 месяцев
• Соцпакет: медицинская страховка, корпоративные мероприятия

Условия:
- Работа с клиентами под руководством наставника
- Изучение рынка недвижимости и объектов
- Помощь в организации просмотров и сделок
- Еженедельные отчёты и планерки`,
        realtor: `Офер на позицию риэлтора:

• Оклад: 50,000 руб. + комиссия с продаж (от 30% до 50% в зависимости от объёма)
• График: полный рабочий день, гибкий график
• Автономность: самостоятельная работа с клиентами
• Инструменты: доступ к CRM, база объектов, маркетинговые материалы
• Соцпакет: медицинская страховка, корпоративные мероприятия, обучение

Условия:
- Самостоятельная работа с клиентами от лида до сделки
- Работа с объектами недвижимости (апартаменты, виллы, коммерческая недвижимость)
- Ведение переговоров и сопровождение сделок
- Еженедельные отчёты и участие в планерках`,
      },
      statusDescription: {
        REJECTED: 'К сожалению, на текущем этапе вы не подходите для работы в нашем агентстве. Рекомендуем пройти дополнительное обучение и попробовать снова.',
        OFFER_TRAINEE: 'Поздравляем! Вы прошли отбор на позицию стажёра. Мы предлагаем вам начать карьеру в нашем агентстве с позиции стажёра с возможностью дальнейшего роста.',
        OFFER_REALTOR: 'Поздравляем! Вы прошли отбор на позицию риэлтора. Мы предлагаем вам начать работу в нашем агентстве на позиции риэлтора.',
        OFFER_DECLINED: 'Вы отклонили предложение о работе. Если передумаете, свяжитесь с HR-отделом.',
      },
    },
    // HR
    hr: {
      dashboard: {
        title: 'Воронка обучения',
        subtitle: 'Обзор кандидатов по статусам прохождения обучения',
        candidates: 'Список кандидатов',
        name: 'ФИО',
        username: 'Логин',
        course: 'Курс',
        status: 'Статус',
        score: 'Балл',
        offer: 'Офер',
        actions: 'Действия',
        details: 'Подробнее',
      },
      users: {
        title: 'Кандидаты',
        backToList: '← Назад к списку кандидатов',
        candidateDetails: 'Кандидат: {name}',
        basicInfo: 'Основная информация',
        role: 'Роль',
        activeCourse: 'Активный курс',
        courseTitle: 'Название',
        lessonsCount: 'Уроков',
        quizAvailable: 'Тест',
        noCourse: 'Курс не выбран',
        attempts: 'Попытки прохождения теста',
        courseName: 'Курс',
        date: 'Дата',
        score: 'Балл',
      },
      courses: {
        title: 'Курсы',
        subtitle: 'Управление учебными курсами',
        createNew: 'Создать новый курс',
        active: 'Активен',
        inactive: 'Неактивен',
        lessons: 'Уроков',
        quiz: 'Тест',
        questions: 'вопросов',
        created: 'Создан',
        details: 'Подробнее',
        backToList: '← Назад к списку курсов',
        courseInfo: 'Информация о курсе',
        status: 'Статус',
        createdBy: 'Создал',
        lessonsList: 'Уроки ({count})',
        quizTitle: 'Тест: {title} ({count} вопросов)',
        questionWeight: 'Вес вопроса: {weight} баллов',
        correctAnswer: '✓',
      },
      createCourse: {
        title: 'Создание нового курса',
        step1: 'Информация о курсе',
        step2: 'Уроки',
        step3: 'Тест',
        courseTitle: 'Название курса',
        courseDescription: 'Описание курса',
        createAndContinue: 'Создать курс и перейти к урокам',
        creating: 'Создание...',
        addLesson: 'Добавить урок',
        lessonNumber: 'Урок {number}',
        lessonTitle: 'Название урока',
        lessonContent: 'Содержание урока',
        saveAndContinue: 'Сохранить уроки и перейти к тесту',
        saving: 'Сохранение...',
        quizTitle: 'Название теста',
        quizDescription: 'Описание теста',
        questions: 'Вопросы',
        addQuestion: 'Добавить вопрос',
        questionNumber: 'Вопрос {number}',
        questionText: 'Текст вопроса',
        options: 'Варианты ответов',
        option: 'Вариант {number}',
        correctAnswer: 'Правильный ответ',
        questionWeight: 'Вес вопроса (баллы)',
        saveAndFinish: 'Сохранить тест и завершить',
        fillAllFields: 'Заполните все поля',
      },
      funnel: {
        total: 'Всего кандидатов',
        NEW: 'Новых (NEW)',
        COURSE_IN_PROGRESS: 'В обучении',
        QUIZ_PENDING: 'Ожидают тест',
        QUIZ_COMPLETED: 'Тест завершён',
        REJECTED: 'Отказ',
        OFFER_TRAINEE: 'Офер стажёр',
        OFFER_REALTOR: 'Офер риэлтор',
        OFFER_DECLINED: 'Офер отклонён',
        HIRED_TRAINEE: 'Нанят как стажёр',
        HIRED_REALTOR: 'Нанят как риэлтор',
      },
    },
    // Errors
    errors: {
      notFound: '404',
      pageNotFound: 'Страница не найдена',
      pageNotFoundDescription: 'Запрашиваемая страница не существует или была перемещена.',
      backToHome: 'Вернуться на главную',
      somethingWentWrong: 'Что-то пошло не так',
      tryAgain: 'Попробовать снова',
      toHome: 'На главную',
    },
  },
} as const;

export function getTranslation(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations[locale];

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English if translation not found
      value = translations.en;
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Replace parameters
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param]?.toString() || match;
    });
  }

  return value;
}

