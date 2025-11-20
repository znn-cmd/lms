import { PrismaClient, UserRole, Language, CandidateStatus, LessonType, QuestionType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.testReview.deleteMany()
  await prisma.answer.deleteMany()
  await prisma.candidateTest.deleteMany()
  await prisma.question.deleteMany()
  await prisma.test.deleteMany()
  await prisma.lessonProgress.deleteMany()
  await prisma.candidateCourse.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.course.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.offerTemplate.deleteMany()
  await prisma.webinarRegistration.deleteMany()
  await prisma.webinar.deleteMany()
  await prisma.knowledgeBase.deleteMany()
  await prisma.trigger.deleteMany()
  await prisma.candidateProfile.deleteMany()
  await prisma.registrationSource.deleteMany()
  await prisma.vacancy.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('demo123', 10)

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashedPassword,
      name: 'Admin',
      surname: 'User',
      role: UserRole.ADMIN,
      language: Language.EN,
    },
  })

  const hr = await prisma.user.create({
    data: {
      email: 'hr@demo.com',
      password: hashedPassword,
      name: 'HR',
      surname: 'Manager',
      role: UserRole.HR,
      language: Language.EN,
    },
  })

  const mentor = await prisma.user.create({
    data: {
      email: 'mentor@demo.com',
      password: hashedPassword,
      name: 'John',
      surname: 'Mentor',
      role: UserRole.MENTOR,
      language: Language.EN,
    },
  })

  const candidate = await prisma.user.create({
    data: {
      email: 'candidate@demo.com',
      password: hashedPassword,
      name: 'Jane',
      surname: 'Candidate',
      role: UserRole.CANDIDATE,
      language: Language.EN,
    },
  })

  console.log('✅ Users created')

  // Create vacancies
  const vacancyRealtor = await prisma.vacancy.create({
    data: {
      title: 'Real Estate Agent (Dubai)',
      titleRu: 'Риэлтор (Дубай)',
      description: 'Join our team as a real estate agent in Dubai. We offer competitive commission rates and comprehensive training.',
      descriptionRu: 'Присоединяйтесь к нашей команде в качестве риэлтора в Дубае. Мы предлагаем конкурентоспособные комиссионные и комплексное обучение.',
      scoreThreshold: 70,
      isActive: true,
      createdById: hr.id,
    },
  })

  const vacancyIntern = await prisma.vacancy.create({
    data: {
      title: 'Sales Intern',
      titleRu: 'Стажёр отдела продаж',
      description: 'Entry-level position for those starting their career in real estate sales.',
      descriptionRu: 'Должность начального уровня для тех, кто начинает карьеру в продажах недвижимости.',
      scoreThreshold: 60,
      isActive: true,
      createdById: hr.id,
    },
  })

  const vacancySMM = await prisma.vacancy.create({
    data: {
      title: 'SMM Manager',
      titleRu: 'SMM Менеджер',
      description: 'Social media marketing manager for our real estate agency.',
      descriptionRu: 'Менеджер по маркетингу в социальных сетях для нашего агентства недвижимости.',
      scoreThreshold: 75,
      isActive: true,
      createdById: hr.id,
    },
  })

  console.log('✅ Vacancies created')

  // Create registration sources
  const sourceLinkedIn = await prisma.registrationSource.create({
    data: {
      name: 'LinkedIn',
      uniqueLink: `register/${vacancyRealtor.id}/linkedin`,
      vacancyId: vacancyRealtor.id,
    },
  })

  const sourceHH = await prisma.registrationSource.create({
    data: {
      name: 'HeadHunter',
      uniqueLink: `register/${vacancyRealtor.id}/hh`,
      vacancyId: vacancyRealtor.id,
    },
  })

  console.log('✅ Registration sources created')

  // Create courses
  const courseRealtor = await prisma.course.create({
    data: {
      title: 'Real Estate Agent Fundamentals',
      titleRu: 'Основы работы риэлтора',
      description: 'Comprehensive course covering all aspects of real estate sales in Dubai.',
      descriptionRu: 'Комплексный курс, охватывающий все аспекты продажи недвижимости в Дубае.',
      language: Language.EN,
      isSequential: true,
      isActive: true,
      createdById: admin.id,
    },
  })

  const courseIntern = await prisma.course.create({
    data: {
      title: 'Sales Intern Training',
      titleRu: 'Обучение стажёра продаж',
      description: 'Basic training course for sales interns.',
      descriptionRu: 'Базовый курс обучения для стажёров продаж.',
      language: Language.EN,
      isSequential: true,
      isActive: true,
      createdById: admin.id,
    },
  })

  const courseSMM = await prisma.course.create({
    data: {
      title: 'SMM Onboarding',
      titleRu: 'Онбординг SMM',
      description: 'Social media marketing course for new SMM managers.',
      descriptionRu: 'Курс по маркетингу в социальных сетях для новых SMM-менеджеров.',
      language: Language.EN,
      isSequential: true,
      isActive: true,
      createdById: admin.id,
    },
  })

  // Update vacancy with start course
  await prisma.vacancy.update({
    where: { id: vacancyRealtor.id },
    data: { startCourseId: courseRealtor.id },
  })

  await prisma.vacancy.update({
    where: { id: vacancyIntern.id },
    data: { startCourseId: courseIntern.id },
  })

  await prisma.vacancy.update({
    where: { id: vacancySMM.id },
    data: { startCourseId: courseSMM.id },
  })

  console.log('✅ Courses created')

  // Create modules for realtor course
  const module1 = await prisma.module.create({
    data: {
      courseId: courseRealtor.id,
      title: 'Introduction to Real Estate',
      titleRu: 'Введение в недвижимость',
      description: 'Learn the basics of real estate industry',
      descriptionRu: 'Изучите основы индустрии недвижимости',
      order: 1,
    },
  })

  const module2 = await prisma.module.create({
    data: {
      courseId: courseRealtor.id,
      title: 'Dubai Market Overview',
      titleRu: 'Обзор рынка Дубая',
      description: 'Understanding the Dubai real estate market',
      descriptionRu: 'Понимание рынка недвижимости Дубая',
      order: 2,
    },
  })

  const module3 = await prisma.module.create({
    data: {
      courseId: courseRealtor.id,
      title: 'Sales Techniques',
      titleRu: 'Техники продаж',
      description: 'Master the art of real estate sales',
      descriptionRu: 'Освойте искусство продажи недвижимости',
      order: 3,
    },
  })

  const module4 = await prisma.module.create({
    data: {
      courseId: courseRealtor.id,
      title: 'Legal Aspects',
      titleRu: 'Юридические аспекты',
      description: 'Legal requirements and contracts',
      descriptionRu: 'Юридические требования и контракты',
      order: 4,
    },
  })

  const module5 = await prisma.module.create({
    data: {
      courseId: courseRealtor.id,
      title: 'Client Relations',
      titleRu: 'Работа с клиентами',
      description: 'Building and maintaining client relationships',
      descriptionRu: 'Построение и поддержание отношений с клиентами',
      order: 5,
    },
  })

  // Create lessons
  const lessons = [
    { moduleId: module1.id, title: 'What is Real Estate?', titleRu: 'Что такое недвижимость?', type: LessonType.VIDEO, order: 1 },
    { moduleId: module1.id, title: 'Types of Properties', titleRu: 'Типы недвижимости', type: LessonType.TEXT, order: 2 },
    { moduleId: module1.id, title: 'Market Players', titleRu: 'Участники рынка', type: LessonType.PDF, order: 3 },
    { moduleId: module1.id, title: 'Industry Overview', titleRu: 'Обзор индустрии', type: LessonType.VIDEO, order: 4 },
    { moduleId: module2.id, title: 'Dubai Districts', titleRu: 'Районы Дубая', type: LessonType.TEXT, order: 1 },
    { moduleId: module2.id, title: 'Price Trends', titleRu: 'Тенденции цен', type: LessonType.PDF, order: 2 },
    { moduleId: module2.id, title: 'Market Analysis', titleRu: 'Анализ рынка', type: LessonType.VIDEO, order: 3 },
    { moduleId: module2.id, title: 'Investment Opportunities', titleRu: 'Инвестиционные возможности', type: LessonType.TEXT, order: 4 },
    { moduleId: module3.id, title: 'Prospecting', titleRu: 'Поиск клиентов', type: LessonType.VIDEO, order: 1 },
    { moduleId: module3.id, title: 'Presentation Skills', titleRu: 'Навыки презентации', type: LessonType.TEXT, order: 2 },
    { moduleId: module3.id, title: 'Closing Techniques', titleRu: 'Техники закрытия сделок', type: LessonType.VIDEO, order: 3 },
    { moduleId: module3.id, title: 'Objection Handling', titleRu: 'Работа с возражениями', type: LessonType.PDF, order: 4 },
    { moduleId: module4.id, title: 'Contract Basics', titleRu: 'Основы контрактов', type: LessonType.TEXT, order: 1 },
    { moduleId: module4.id, title: 'Legal Requirements', titleRu: 'Юридические требования', type: LessonType.PDF, order: 2 },
    { moduleId: module4.id, title: 'Compliance', titleRu: 'Соответствие требованиям', type: LessonType.VIDEO, order: 3 },
    { moduleId: module4.id, title: 'Documentation', titleRu: 'Документация', type: LessonType.TEXT, order: 4 },
    { moduleId: module5.id, title: 'First Contact', titleRu: 'Первый контакт', type: LessonType.VIDEO, order: 1 },
    { moduleId: module5.id, title: 'Building Trust', titleRu: 'Построение доверия', type: LessonType.TEXT, order: 2 },
    { moduleId: module5.id, title: 'Follow-up Strategies', titleRu: 'Стратегии последующего контакта', type: LessonType.PDF, order: 3 },
    { moduleId: module5.id, title: 'Long-term Relationships', titleRu: 'Долгосрочные отношения', type: LessonType.VIDEO, order: 4 },
  ]

  for (const lesson of lessons) {
    await prisma.lesson.create({
      data: {
        ...lesson,
        content: 'https://example.com/lesson-content',
        contentRu: 'https://example.com/lesson-content-ru',
        duration: 15,
      },
    })
  }

  console.log('✅ Modules and lessons created')

  // Create comprehensive test for Real Estate Agent Fundamentals
  const test1 = await prisma.test.create({
    data: {
      title: 'Real Estate Agent Fundamentals - Final Test',
      titleRu: 'Тест по основам работы риэлтора - Финальный',
      description: 'Comprehensive test covering all aspects of real estate agent fundamentals',
      descriptionRu: 'Комплексный тест, охватывающий все аспекты основ работы риэлтора',
      courseId: courseRealtor.id,
      vacancyId: vacancyRealtor.id,
      passingScore: 75,
      timeLimit: 45,
      isActive: true,
    },
  })

  // Create questions with all types
  const questions = [
    // Single Choice Questions
    {
      testId: test1.id,
      text: 'What is the primary role of a real estate agent?',
      textRu: 'Какова основная роль риэлтора?',
      type: QuestionType.SINGLE_CHOICE,
      options: ['Selling properties', 'Buying properties', 'Facilitating property transactions', 'Managing properties'],
      optionsRu: ['Продажа недвижимости', 'Покупка недвижимости', 'Содействие сделкам с недвижимостью', 'Управление недвижимостью'],
      correctAnswer: 'Facilitating property transactions',
      correctAnswerRu: 'Содействие сделкам с недвижимостью',
      points: 10,
      order: 1,
    },
    {
      testId: test1.id,
      text: 'Which document is essential for property transactions in Dubai?',
      textRu: 'Какой документ необходим для сделок с недвижимостью в Дубае?',
      type: QuestionType.SINGLE_CHOICE,
      options: ['NOC', 'Title Deed', 'Ejari', 'All of the above'],
      optionsRu: ['NOC', 'Свидетельство о праве собственности', 'Ejari', 'Все вышеперечисленное'],
      correctAnswer: 'All of the above',
      correctAnswerRu: 'Все вышеперечисленное',
      points: 10,
      order: 2,
    },
    {
      testId: test1.id,
      text: 'What is the typical commission rate for real estate agents in Dubai?',
      textRu: 'Какая типичная комиссия для риэлторов в Дубае?',
      type: QuestionType.SINGLE_CHOICE,
      options: ['1-2%', '2-3%', '3-5%', '5-7%'],
      optionsRu: ['1-2%', '2-3%', '3-5%', '5-7%'],
      correctAnswer: '2-3%',
      correctAnswerRu: '2-3%',
      points: 10,
      order: 3,
    },
    // Multiple Choice Questions
    {
      testId: test1.id,
      text: 'Which of the following are types of real estate? (Select all that apply)',
      textRu: 'Какие из следующих являются типами недвижимости? (Выберите все подходящие)',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Vacant Land'],
      optionsRu: ['Жилая', 'Коммерческая', 'Промышленная', 'Сельскохозяйственная', 'Свободная земля'],
      correctAnswer: JSON.stringify(['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Vacant Land']),
      correctAnswerRu: JSON.stringify(['Жилая', 'Коммерческая', 'Промышленная', 'Сельскохозяйственная', 'Свободная земля']),
      points: 15,
      order: 4,
    },
    {
      testId: test1.id,
      text: 'What are the key skills required for a successful real estate agent? (Select all)',
      textRu: 'Какие ключевые навыки необходимы успешному риэлтору? (Выберите все)',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['Communication', 'Negotiation', 'Market Knowledge', 'Technical Skills', 'Time Management'],
      optionsRu: ['Коммуникация', 'Переговоры', 'Знание рынка', 'Технические навыки', 'Управление временем'],
      correctAnswer: JSON.stringify(['Communication', 'Negotiation', 'Market Knowledge', 'Time Management']),
      correctAnswerRu: JSON.stringify(['Коммуникация', 'Переговоры', 'Знание рынка', 'Управление временем']),
      points: 15,
      order: 5,
    },
    // Open Answer Questions
    {
      testId: test1.id,
      text: 'Describe the importance of market research in real estate. What factors should be considered?',
      textRu: 'Опишите важность исследования рынка в недвижимости. Какие факторы следует учитывать?',
      type: QuestionType.OPEN_ANSWER,
      options: [],
      optionsRu: [],
      correctAnswer: null,
      correctAnswerRu: null,
      points: 20,
      order: 6,
    },
    {
      testId: test1.id,
      text: 'Explain the process of closing a real estate deal from initial contact to completion.',
      textRu: 'Объясните процесс закрытия сделки с недвижимостью от первого контакта до завершения.',
      type: QuestionType.OPEN_ANSWER,
      options: [],
      optionsRu: [],
      correctAnswer: null,
      correctAnswerRu: null,
      points: 20,
      order: 7,
    },
  ]

  for (const question of questions) {
    await prisma.question.create({ data: question })
  }

  console.log('✅ Tests and questions created')

  // Create candidate profile
  const candidateProfile = await prisma.candidateProfile.create({
    data: {
      userId: candidate.id,
      city: 'Dubai',
      country: 'UAE',
      experience: 2,
      languages: ['English', 'Russian'],
      resumeLink: 'https://linkedin.com/in/jane-candidate',
      status: CandidateStatus.IN_COURSE,
      currentVacancyId: vacancyRealtor.id,
      mentorId: mentor.id,
      registrationSourceId: sourceLinkedIn.id,
    },
  })

  // Assign course to candidate
  await prisma.candidateCourse.create({
    data: {
      candidateId: candidateProfile.id,
      courseId: courseRealtor.id,
      progress: 25,
      startedAt: new Date(),
    },
  })

  console.log('✅ Candidate profile created')

  // Create offer template
  const offerTemplate = await prisma.offerTemplate.create({
    data: {
      name: 'Standard Real Estate Agent Offer',
      nameRu: 'Стандартное предложение риэлтора',
      content: `Dear {{candidateName}},

We are pleased to offer you the position of {{vacancyTitle}}.

Terms:
- Commission: {{commission}}%
- Start date: {{startDate}}
- Location: {{location}}

We look forward to welcoming you to our team.

Best regards,
HR Team`,
      contentRu: `Уважаемый(ая) {{candidateName}},

Мы рады предложить вам должность {{vacancyTitle}}.

Условия:
- Комиссия: {{commission}}%
- Дата начала: {{startDate}}
- Местоположение: {{location}}

Мы с нетерпением ждем приветствия вас в нашей команде.

С уважением,
Команда HR`,
      variables: ['candidateName', 'vacancyTitle', 'commission', 'startDate', 'location'],
      isActive: true,
    },
  })

  console.log('✅ Offer templates created')

  // Create webinar
  const webinar = await prisma.webinar.create({
    data: {
      title: 'Introduction to Dubai Real Estate Market',
      titleRu: 'Введение в рынок недвижимости Дубая',
      description: 'Join us for an informative webinar about the Dubai real estate market.',
      descriptionRu: 'Присоединяйтесь к нам на информативный вебинар о рынке недвижимости Дубая.',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      duration: 60,
      maxParticipants: 50,
      isActive: true,
    },
  })

  console.log('✅ Webinar created')

  // Create knowledge base entries
  const kbRoot = await prisma.knowledgeBase.create({
    data: {
      title: 'Real Estate Knowledge Base',
      titleRu: 'База знаний по недвижимости',
      type: 'article',
      tags: ['general'],
      order: 0,
    },
  })

  await prisma.knowledgeBase.create({
    data: {
      title: 'Dubai Property Laws',
      titleRu: 'Законы о недвижимости Дубая',
      parentId: kbRoot.id,
      type: 'document',
      tags: ['legal', 'dubai'],
      order: 1,
    },
  })

  console.log('✅ Knowledge base created')

  // Create 8 candidates in talent pool
  const talentPoolCandidates = [
    {
      name: 'Alex',
      surname: 'Petrov',
      email: 'alex.petrov@example.com',
      city: 'Moscow',
      country: 'Russia',
      experience: 5,
      languages: ['Russian', 'English'],
      status: CandidateStatus.IN_TALENT_POOL,
      vacancyId: vacancyRealtor.id,
    },
    {
      name: 'Maria',
      surname: 'Ivanova',
      email: 'maria.ivanova@example.com',
      city: 'Dubai',
      country: 'UAE',
      experience: 3,
      languages: ['English', 'Arabic'],
      status: CandidateStatus.IN_TALENT_POOL,
      vacancyId: vacancyRealtor.id,
    },
    {
      name: 'Ahmed',
      surname: 'Al-Mansoori',
      email: 'ahmed.almansoori@example.com',
      city: 'Abu Dhabi',
      country: 'UAE',
      experience: 4,
      languages: ['Arabic', 'English'],
      status: CandidateStatus.IN_TALENT_POOL,
      vacancyId: vacancyRealtor.id,
    },
    {
      name: 'Sarah',
      surname: 'Johnson',
      email: 'sarah.johnson@example.com',
      city: 'Dubai',
      country: 'UAE',
      experience: 2,
      languages: ['English'],
      status: CandidateStatus.IN_TALENT_POOL,
      vacancyId: vacancyRealtor.id,
    },
    {
      name: 'Dmitry',
      surname: 'Volkov',
      email: 'dmitry.volkov@example.com',
      city: 'Dubai',
      country: 'UAE',
      experience: 6,
      languages: ['Russian', 'English', 'Arabic'],
      status: CandidateStatus.IN_TALENT_POOL,
      vacancyId: vacancyRealtor.id,
    },
    {
      name: 'Fatima',
      surname: 'Hassan',
      email: 'fatima.hassan@example.com',
      city: 'Dubai',
      country: 'UAE',
      experience: 1,
      languages: ['Arabic', 'English', 'Urdu'],
      status: CandidateStatus.IN_TALENT_POOL,
      vacancyId: vacancyRealtor.id,
    },
    {
      name: 'James',
      surname: 'Wilson',
      email: 'james.wilson@example.com',
      city: 'Dubai',
      country: 'UAE',
      experience: 7,
      languages: ['English'],
      status: CandidateStatus.IN_TALENT_POOL,
      vacancyId: vacancyRealtor.id,
    },
    {
      name: 'Elena',
      surname: 'Kozlova',
      email: 'elena.kozlova@example.com',
      city: 'Dubai',
      country: 'UAE',
      experience: 4,
      languages: ['Russian', 'English', 'French'],
      status: CandidateStatus.IN_TALENT_POOL,
      vacancyId: vacancyRealtor.id,
    },
  ]

  for (const candidateData of talentPoolCandidates) {
    const user = await prisma.user.create({
      data: {
        email: candidateData.email,
        password: hashedPassword,
        name: candidateData.name,
        surname: candidateData.surname,
        role: UserRole.CANDIDATE,
        language: Language.EN,
      },
    })

    await prisma.candidateProfile.create({
      data: {
        userId: user.id,
        city: candidateData.city,
        country: candidateData.country,
        experience: candidateData.experience,
        languages: candidateData.languages,
        status: candidateData.status,
        currentVacancyId: candidateData.vacancyId,
        registrationSourceId: sourceLinkedIn.id,
      },
    })
  }

  console.log('✅ Talent pool candidates created')

  // Assign test to existing candidate
  await prisma.candidateTest.create({
    data: {
      candidateId: candidateProfile.id,
      testId: test1.id,
      status: 'pending',
    },
  })

  console.log('✅ Test assigned to candidate')

  // Create candidates for each kanban status (4-14 per status)
  const generateCandidates = async (
    count: number,
    status: CandidateStatus,
    progress?: number,
    testScore?: number | null,
    testStatus?: string,
    offerStatus?: string
  ) => {
    const firstNames = [
      'Michael', 'David', 'Sarah', 'Emily', 'James', 'Robert', 'Jennifer', 'Lisa',
      'William', 'Richard', 'Jessica', 'Ashley', 'Thomas', 'Daniel', 'Matthew',
      'Christopher', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew',
      'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Jason',
      'Edward', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan',
      'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel',
      'Frank', 'Gregory', 'Raymond', 'Alexander', 'Patrick', 'Jack', 'Dennis',
      'Jerry', 'Tyler', 'Aaron', 'Jose', 'Henry', 'Adam', 'Douglas', 'Nathan',
      'Zachary', 'Kyle', 'Noah', 'Ethan', 'Jeremy', 'Walter', 'Christian', 'Keith',
      'Roger', 'Terry', 'Austin', 'Sean', 'Gerald', 'Carl', 'Harold', 'Dylan',
      'Jesse', 'Jordan', 'Bryan', 'Billy', 'Joe', 'Bruce', 'Gabriel', 'Logan',
      'Alan', 'Juan', 'Wayne', 'Roy', 'Ralph', 'Randy', 'Eugene', 'Vincent',
      'Russell', 'Louis', 'Philip', 'Bobby', 'Johnny', 'Bradley', 'Anna', 'Maria',
      'Elena', 'Olga', 'Natalia', 'Svetlana', 'Irina', 'Tatiana', 'Yulia', 'Ekaterina',
      'Anastasia', 'Daria', 'Victoria', 'Kristina', 'Polina', 'Sofia', 'Alina', 'Veronika'
    ]
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas',
      'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris',
      'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen',
      'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
      'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter',
      'Roberts', 'Petrov', 'Ivanov', 'Sidorov', 'Kozlov', 'Volkov', 'Sokolov', 'Popov',
      'Lebedev', 'Novikov', 'Morozov', 'Petrov', 'Volkov', 'Alekseev', 'Lebedev', 'Semenov',
      'Egorov', 'Pavlov', 'Kozlov', 'Stepanov', 'Nikolaev', 'Orlov', 'Andreev', 'Makarov',
      'Nikitin', 'Zakharov', 'Zaytsev', 'Solovyov', 'Borisov', 'Yakovlev', 'Grigoriev', 'Romanov',
      'Vorobyov', 'Sergeev', 'Spiridonov', 'Mikhailov', 'Fedorov', 'Morozov', 'Volkov', 'Alekseev'
    ]

    const candidates = []
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: firstName,
          surname: lastName,
          role: UserRole.CANDIDATE,
          language: Language.EN,
        },
      })

      const profile = await prisma.candidateProfile.create({
        data: {
          userId: user.id,
          city: 'Dubai',
          country: 'UAE',
          experience: Math.floor(Math.random() * 10) + 1,
          languages: ['English', Math.random() > 0.5 ? 'Russian' : 'Arabic'],
          status,
          currentVacancyId: vacancyRealtor.id,
          mentorId: mentor.id,
          registrationSourceId: sourceLinkedIn.id,
        },
      })

      // Create course progress if needed
      if (status === CandidateStatus.IN_COURSE && progress !== undefined) {
        await prisma.candidateCourse.create({
          data: {
            candidateId: profile.id,
            courseId: courseRealtor.id,
            progress,
            startedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          },
        })
      }

      // Create test if needed
      if (status === CandidateStatus.TEST_COMPLETED && testScore !== undefined) {
        const candidateTest = await prisma.candidateTest.create({
          data: {
            candidateId: profile.id,
            testId: test1.id,
            status: testStatus || 'completed',
            score: testScore,
            completedAt: testStatus === 'completed' ? new Date() : null,
            startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          },
        })

        // Create answers for the test
        const testQuestions = await prisma.question.findMany({
          where: { testId: test1.id },
          orderBy: { order: 'asc' },
        })

        for (const question of testQuestions) {
          let answerValue: any = null
          let isCorrect: boolean | null = null
          let points = 0
          const score = testScore ?? 0
          const passed = score >= test1.passingScore

          if (question.type === QuestionType.SINGLE_CHOICE) {
            answerValue = passed ? question.correctAnswer : question.options[0]
            isCorrect = answerValue === question.correctAnswer
            points = isCorrect ? question.points : 0
          } else if (question.type === QuestionType.MULTIPLE_CHOICE) {
            const correctAnswers = JSON.parse(question.correctAnswer || '[]')
            answerValue = passed ? correctAnswers : [question.options[0]]
            isCorrect = JSON.stringify(answerValue.sort()) === JSON.stringify(correctAnswers.sort())
            points = isCorrect ? question.points : 0
          } else {
            answerValue = passed
              ? 'Comprehensive answer demonstrating understanding of the topic.'
              : 'Brief answer'
            isCorrect = null
            points = passed ? question.points : Math.floor(question.points * 0.3)
          }

          await prisma.answer.create({
            data: {
              candidateTestId: candidateTest.id,
              questionId: question.id,
              answer: JSON.stringify(answerValue),
              isCorrect,
              points,
            },
          })
        }
      }

      // Create offer if needed
      if (offerStatus) {
        await prisma.offer.create({
          data: {
            type: 'personal',
            candidateId: profile.id,
            vacancyId: vacancyRealtor.id,
            content: `Dear ${firstName} ${lastName}, We are pleased to offer you the position.`,
            status: offerStatus,
            sentAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
            respondedAt: offerStatus !== 'sent' ? new Date() : null,
          },
        })
      }

      candidates.push(profile)
    }
    return candidates
  }

  // New Candidate (REGISTERED, PROFILE_COMPLETED) - 8 candidates
  await generateCandidates(8, CandidateStatus.REGISTERED)

  // Started Learning (IN_COURSE, progress < 50) - 10 candidates
  for (let i = 0; i < 10; i++) {
    await generateCandidates(1, CandidateStatus.IN_COURSE, Math.floor(Math.random() * 50))
  }

  // In Training (IN_COURSE, progress >= 50 && < 100) - 12 candidates
  for (let i = 0; i < 12; i++) {
    await generateCandidates(1, CandidateStatus.IN_COURSE, Math.floor(Math.random() * 50) + 50)
  }

  // Started Test (TEST_COMPLETED, test in progress) - 6 candidates
  for (let i = 0; i < 6; i++) {
    await generateCandidates(1, CandidateStatus.TEST_COMPLETED, undefined, null, 'in_progress')
  }

  // Test Passed Successfully (TEST_COMPLETED, score >= passingScore) - 14 candidates
  for (let i = 0; i < 14; i++) {
    const score = Math.floor(Math.random() * 20) + 75
    const profile = await generateCandidates(1, CandidateStatus.TEST_COMPLETED, undefined, score, 'completed')
    // Create offer for passed test
    if (profile[0]) {
      await prisma.offer.create({
        data: {
          type: 'personal',
          candidateId: profile[0].id,
          vacancyId: vacancyRealtor.id,
          content: `Dear candidate, We are pleased to offer you the position.`,
          status: 'sent',
          sentAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      })
      // Update status to OFFER_SENT for some candidates
      if (i < 7) {
        await prisma.candidateProfile.update({
          where: { id: profile[0].id },
          data: { status: CandidateStatus.OFFER_SENT },
        })
      }
    }
  }

  // Offer Accepted (OFFER_ACCEPTED, HIRED) - 9 candidates
  for (let i = 0; i < 5; i++) {
    await generateCandidates(1, CandidateStatus.OFFER_ACCEPTED, undefined, undefined, undefined, 'accepted')
  }
  for (let i = 0; i < 4; i++) {
    await generateCandidates(1, CandidateStatus.HIRED, undefined, undefined, undefined, 'accepted')
  }

  // Test Failed (REJECTED, TEST_COMPLETED with score < passingScore) - 7 candidates
  for (let i = 0; i < 4; i++) {
    await generateCandidates(1, CandidateStatus.REJECTED)
  }
  for (let i = 0; i < 3; i++) {
    // Create candidates with failed test scores (below passing score)
    await generateCandidates(1, CandidateStatus.TEST_COMPLETED, undefined, Math.floor(Math.random() * 20) + 50, 'completed')
  }

  // Offer Declined (OFFER_DECLINED) - 5 candidates
  for (let i = 0; i < 5; i++) {
    await generateCandidates(1, CandidateStatus.OFFER_DECLINED, undefined, undefined, undefined, 'declined')
  }

  console.log('✅ Kanban candidates created')

  console.log('🎉 Seeding completed!')
  console.log('\nDemo accounts:')
  console.log('Admin: admin@demo.com / demo123')
  console.log('HR: hr@demo.com / demo123')
  console.log('Mentor: mentor@demo.com / demo123')
  console.log('Candidate: candidate@demo.com / demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

