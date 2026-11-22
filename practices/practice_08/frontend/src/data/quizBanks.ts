export interface QuizQuestion {
  id: string
  sentence: string
  translation: string
  options: string[]
  correctIndex: number
  ruleExplanation: string
}

export const QUIZ_BANKS: Record<string, QuizQuestion[]> = {
  'pres-perf': [
    {
      id: 'pp-1',
      sentence: 'She _____ the quarterly database report already, so the deploy can begin.',
      translation: 'Она уже завершила квартальный отчет по базе данных, так что деплой может начаться.',
      options: ['has completed', 'completed', 'is completing', 'will complete'],
      correctIndex: 0,
      ruleExplanation: 'Маркер «already» указывает на действие с результатом в настоящем: have/has + V3 (Present Perfect).'
    },
    {
      id: 'pp-2',
      sentence: 'The engineers _____ the automated pipeline last Tuesday afternoon.',
      translation: 'Инженеры развернули автоматический пайплайн в прошлый вторник днем.',
      options: ['have launched', 'launched', 'were launched', 'had launched'],
      correctIndex: 1,
      ruleExplanation: 'Точное указание времени в прошлом («last Tuesday») строго требует Past Simple (launched).'
    },
    {
      id: 'pp-3',
      sentence: '_____ you ever refactored a legacy distributed system under high workload?',
      translation: 'Вы когда-нибудь рефакторили распределенную систему под высокой нагрузкой?',
      options: ['Did', 'Were', 'Have', 'Do'],
      correctIndex: 2,
      ruleExplanation: 'Вопрос о жизненном опыте со словом «ever» строится в Present Perfect: Have you ever + V3.'
    },
    {
      id: 'pp-4',
      sentence: 'We _____ never observed such low latency in any enterprise architecture before.',
      translation: 'Мы никогда раньше не наблюдали столь низкой задержки в корпоративной архитектуре.',
      options: ['did', 'have', 'had', 'were'],
      correctIndex: 1,
      ruleExplanation: 'Наречие «never ... before» для опыта до настоящего момента требует Present Perfect (have never observed).'
    }
  ],
  'cond-2': [
    {
      id: 'c2-1',
      sentence: 'If I _____ more free time, I would learn three new programming languages.',
      translation: 'Если бы у меня было больше времени, я бы учил три новых языка.',
      options: ['have', 'had', 'would have', 'had had'],
      correctIndex: 1,
      ruleExplanation: 'Second Conditional (нереальное настоящее): в придаточном с If используется Past Simple (had).'
    },
    {
      id: 'c2-2',
      sentence: 'If we had tested the edge cases yesterday, the outage _____ not have happened.',
      translation: 'Если бы мы протестировали граничные случаи вчера, сбоя бы не произошло.',
      options: ['will', 'would', 'did', 'had'],
      correctIndex: 1,
      ruleExplanation: 'Third Conditional (нереальное прошлое): главная часть строится через would + have + V3.'
    },
    {
      id: 'c2-3',
      sentence: 'She would travel around the world if she _____ remotely as a senior engineer.',
      translation: 'Она бы путешествовала по миру, если бы работала удаленно сеньор-инженером.',
      options: ['works', 'worked', 'would work', 'has worked'],
      correctIndex: 1,
      ruleExplanation: 'После if во втором типе условных предложений используется Past Simple (worked), без would.'
    },
    {
      id: 'c2-4',
      sentence: 'If they _____ the database migration earlier, the release would have succeeded.',
      translation: 'Если бы они развернули миграцию базы данных раньше, релиз прошел бы успешно.',
      options: ['deployed', 'have deployed', 'had deployed', 'would deploy'],
      correctIndex: 2,
      ruleExplanation: 'Third Conditional требует Past Perfect (had + V3) в части с условием If.'
    }
  ],
  'pass-voice': [
    {
      id: 'pv-1',
      sentence: 'All critical microservices _____ continuously by our automated observability stack.',
      translation: 'Все критические микросервисы непрерывно мониторятся нашим стеком наблюдаемости.',
      options: ['monitor', 'are monitored', 'are monitoring', 'have monitored'],
      correctIndex: 1,
      ruleExplanation: 'Present Simple Passive для регулярного действия над объектом: are + V3 (are monitored).'
    },
    {
      id: 'pv-2',
      sentence: 'The integration tests _____ before the pull request was merged yesterday.',
      translation: 'Интеграционные тесты были выполнены до того, как пулл-реквест был слит вчера.',
      options: ['executed', 'are executed', 'were executed', 'have executed'],
      correctIndex: 2,
      ruleExplanation: 'Past Simple Passive для завершенного действия в прошлом: were + V3 (were executed).'
    },
    {
      id: 'pv-3',
      sentence: 'All authentication tokens must _____ confidential by every team member.',
      translation: 'Все токены аутентификации должны храниться в тайне каждым членом команды.',
      options: ['keep', 'be kept', 'been kept', 'keeping'],
      correctIndex: 1,
      ruleExplanation: 'Пассивный залог после модального глагола must: must + be + V3 (must be kept).'
    },
    {
      id: 'pv-4',
      sentence: 'Unauthorized access to private user records _____ completely by the firewall.',
      translation: 'Несанкционированный доступ к приватным записям полностью предотвращается фаерволом.',
      options: ['is prevented', 'prevents', 'preventing', 'has prevent'],
      correctIndex: 0,
      ruleExplanation: 'Подлежащее «access» не выполняет действие, а подвергается ему: is prevented.'
    }
  ],
  'rel-clauses': [
    {
      id: 'rc-1',
      sentence: 'The software architect _____ designed our distributed system received an award.',
      translation: 'Архитектор ПО, который спроектировал нашу распределенную систему, получил премию.',
      options: ['which', 'who', 'what', 'whose'],
      correctIndex: 1,
      ruleExplanation: 'Для людей в определительных придаточных предложениях используется местоимение who.'
    },
    {
      id: 'rc-2',
      sentence: 'Docker containers, _____ isolate operating system processes, enhance reproducibility.',
      translation: 'Контейнеры Docker, которые изолируют процессы ОС, повышают воспроизводимость.',
      options: ['that', 'who', 'which', 'where'],
      correctIndex: 2,
      ruleExplanation: 'В non-defining relative clauses (выделенных запятыми) для неодушевленных объектов используется только which (не that).'
    },
    {
      id: 'rc-3',
      sentence: 'That is the developer _____ algorithm reduced server latency by forty percent.',
      translation: 'Это разработчик, чей алгоритм сократил задержку сервера на сорок процентов.',
      options: ['who', 'which', 'whose', 'whom'],
      correctIndex: 2,
      ruleExplanation: 'Принадлежность («чей алгоритм») выражается относительным местоимением whose.'
    },
    {
      id: 'rc-4',
      sentence: 'We visited the data center _____ all our cloud backups are stored securely.',
      translation: 'Мы посетили дата-центр, где безопасно хранятся все наши облачные бэкапы.',
      options: ['which', 'where', 'when', 'who'],
      correctIndex: 1,
      ruleExplanation: 'Для указания места в придаточном предложении используется союзное слово where.'
    }
  ],
  'a1-basics': [
    {
      id: 'a1-1',
      sentence: 'She _____ clean and readable code every single morning.',
      translation: 'Она пишет чистый и читаемый код каждое утро.',
      options: ['write', 'writes', 'writing', 'is write'],
      correctIndex: 1,
      ruleExplanation: 'В Present Simple для 3-го лица единственного числа (she) к глаголу добавляется окончание -s (writes).'
    },
    {
      id: 'a1-2',
      sentence: 'Our development team _____ not ignore software accessibility guidelines.',
      translation: 'Наша команда разработки не игнорирует руководства по доступности ПО.',
      options: ['do', 'does', 'is', 'are'],
      correctIndex: 1,
      ruleExplanation: '«Our team» выступает как единственное число, поэтому в отрицании Present Simple нужен вспомогательный глагол does.'
    },
    {
      id: 'a1-3',
      sentence: 'We always _____ fresh coffee before our daily engineering standup.',
      translation: 'Мы всегда пьем свежий кофе перед нашим ежедневным инженерным стендапом.',
      options: ['drinks', 'drinking', 'drink', 'drank'],
      correctIndex: 2,
      ruleExplanation: 'Регулярная привычка с местоимением we требует базовой формы глагола в Present Simple (drink).'
    },
    {
      id: 'a1-4',
      sentence: '_____ your team use automated tests for every new feature?',
      translation: 'Использует ли ваша команда автоматические тесты для каждой новой фичи?',
      options: ['Do', 'Does', 'Is', 'Has'],
      correctIndex: 1,
      ruleExplanation: 'Вопрос в Present Simple к подлежащему «your team» (it) начинается с Does.'
    }
  ],
  'a1-articles': [
    {
      id: 'art-1',
      sentence: 'An experienced developer always writes _____ clear commit message.',
      translation: 'Опытный разработчик всегда пишет понятное сообщение коммита.',
      options: ['a', 'an', 'the', '—'],
      correctIndex: 0,
      ruleExplanation: 'Исчисляемое существительное в единственном числе («commit message») упоминается впервые; перед согласным звуком [k] ставим «a».'
    },
    {
      id: 'art-2',
      sentence: 'The laptop on the desk has _____ aluminum body and runs Linux.',
      translation: 'Ноутбук на столе имеет алюминиевый корпус и работает на Linux.',
      options: ['a', 'an', 'the', '—'],
      correctIndex: 1,
      ruleExplanation: 'Перед гласным звуком в слове «aluminum» используется неопределенный артикль «an».'
    },
    {
      id: 'art-3',
      sentence: 'Clean code is essential for _____ software engineering.',
      translation: 'Чистый код необходим для программной инженерии.',
      options: ['a', 'an', 'the', '— (без артикля)'],
      correctIndex: 3,
      ruleExplanation: 'Перед абстрактными и неисчисляемыми понятиями в общем смысле артикль не ставится (Zero Article).'
    },
    {
      id: 'art-4',
      sentence: 'Please push the changes to _____ remote repository we created yesterday.',
      translation: 'Пожалуйста, отправьте изменения в тот удаленный репозиторий, который мы создали вчера.',
      options: ['a', 'an', 'the', '—'],
      correctIndex: 2,
      ruleExplanation: 'Речь идет о конкретном репозитории («который мы создали вчера»), поэтому необходим определенный артикль «the».'
    }
  ],
  'past-continuous': [
    {
      id: 'pc-1',
      sentence: 'While the engineer _____ the microservice, the pipeline detected a memory leak.',
      translation: 'Пока инженер разворачивал микросервис, пайплайн обнаружил утечку памяти.',
      options: ['deployed', 'was deploying', 'is deploying', 'has deployed'],
      correctIndex: 1,
      ruleExplanation: 'Фоновое длительное действие в прошлом («while») выражается через Past Continuous (was deploying).'
    },
    {
      id: 'pc-2',
      sentence: 'They were discussing the database schema when the architect _____ an urgent alert.',
      translation: 'Они обсуждали схему базы данных, когда архитектор получил срочное уведомление.',
      options: ['was receiving', 'received', 'receives', 'had received'],
      correctIndex: 1,
      ruleExplanation: 'Краткое действие, прерывающее длительный процесс (после when), ставится в Past Simple (received).'
    },
    {
      id: 'pc-3',
      sentence: 'We _____ the latency drop all evening yesterday while users saw slow responses.',
      translation: 'Мы расследовали падение задержки весь вчерашний вечер.',
      options: ['investigated', 'were investigating', 'have investigated', 'are investigating'],
      correctIndex: 1,
      ruleExplanation: 'Длительный процесс в указанный период прошлого («all evening yesterday») требует Past Continuous.'
    },
    {
      id: 'pc-4',
      sentence: 'What _____ you doing when the production server went offline?',
      translation: 'Что ты делал, когда продакшн-сервер ушел в оффлайн?',
      options: ['did', 'was', 'were', 'had'],
      correctIndex: 2,
      ruleExplanation: 'В Past Continuous с местоимением you используется вспомогательный глагол were.'
    }
  ],
  'a2-prepositions': [
    {
      id: 'pr-1',
      sentence: 'Our sprint planning meeting starts _____ nine oclock on Monday morning.',
      translation: 'Наше планирование спринта начинается в девять часов в понедельник утром.',
      options: ['in', 'on', 'at', 'by'],
      correctIndex: 2,
      ruleExplanation: 'С точным временем на часах всегда используется предлог «at» (at nine oclock).'
    },
    {
      id: 'pr-2',
      sentence: 'The security patch was released _____ November without any downtime.',
      translation: 'Патч безопасности был выпущен в ноябре без какого-либо простоя.',
      options: ['at', 'on', 'in', 'to'],
      correctIndex: 2,
      ruleExplanation: 'С месяцами, годами и сезонами используется предлог «in» (in November).'
    },
    {
      id: 'pr-3',
      sentence: 'The big release is scheduled _____ the fifteenth of March.',
      translation: 'Крупный релиз запланирован на пятнадцатое марта.',
      options: ['in', 'at', 'on', 'for'],
      correctIndex: 2,
      ruleExplanation: 'С конкретными датами и днями недели используется предлог «on» (on the fifteenth).'
    },
    {
      id: 'pr-4',
      sentence: 'She usually reviews architecture diagrams _____ the train ride home.',
      translation: 'Она обычно просматривает схемы архитектуры в поезде по дороге домой.',
      options: ['in', 'on', 'at', 'by'],
      correctIndex: 1,
      ruleExplanation: 'С общественным транспортом (train, bus, plane) используется предлог «on» (on the train).'
    }
  ],
  'future-forms': [
    {
      id: 'ff-1',
      sentence: 'Our team _____ rewrite the legacy authentication module during the next sprint.',
      translation: 'Наша команда собирается переписать устаревший модуль аутентификации в следующем спринте.',
      options: ['will', 'is going to', 'rewrites', 'has'],
      correctIndex: 1,
      ruleExplanation: 'Заранее обдуманное намерение и план выражается конструкцией «be going to» (is going to rewrite).'
    },
    {
      id: 'ff-2',
      sentence: 'The server is running out of RAM, so the orchestrator _____ spin up extra workers.',
      translation: 'На сервере заканчивается память, поэтому оркестратор запустит дополнительные воркеры.',
      options: ['will', 'is', 'was going to', 'has'],
      correctIndex: 0,
      ruleExplanation: 'Спонтанная реакция или логический прогноз на основе текущей ситуации выражается через «will».'
    },
    {
      id: 'ff-3',
      sentence: 'We _____ with the product stakeholders tomorrow morning at ten oclock.',
      translation: 'Мы встречаемся со стейкхолдерами продукта завтра утром в десять часов.',
      options: ['meet', 'are meeting', 'met', 'have met'],
      correctIndex: 1,
      ruleExplanation: 'Точная личная договоренность с указанием времени и места выражается через Present Continuous (are meeting).'
    },
    {
      id: 'ff-4',
      sentence: 'Do not worry about the broken build, I _____ fix it right now.',
      translation: 'Не переживай из-за сломанной сборки, я починю ее прямо сейчас.',
      options: ['am going to', 'will', 'am fixing', 'fixed'],
      correctIndex: 1,
      ruleExplanation: 'Мгновенное решение или обещание в момент речи всегда использует «will».'
    }
  ],
  'b1-gerund-inf': [
    {
      id: 'gi-1',
      sentence: 'The team wanted to avoid _____ subtle race conditions into the codebase.',
      translation: 'Команда хотела избежать внесения тонких состояний гонки в кодовую базу.',
      options: ['to introduce', 'introducing', 'introduce', 'introduced'],
      correctIndex: 1,
      ruleExplanation: 'После глагола «avoid» в английском языке всегда используется герундий (V-ing): avoid introducing.'
    },
    {
      id: 'gi-2',
      sentence: 'The senior engineer suggested _____ the authentication middleware first.',
      translation: 'Сеньор-инженер предложил сначала отрефакторить прослойку аутентификации.',
      options: ['to refactor', 'refactor', 'refactoring', 'refactored'],
      correctIndex: 2,
      ruleExplanation: 'Глагол «suggest» требует после себя герундий (suggest + V-ing), а не инфинитив с to.'
    },
    {
      id: 'gi-3',
      sentence: 'She managed _____ the SQL query by indexing the primary columns.',
      translation: 'Она сумела оптимизировать SQL-запрос, проиндексировав основные столбцы.',
      options: ['optimizing', 'to optimize', 'optimize', 'optimized'],
      correctIndex: 1,
      ruleExplanation: 'После глагола «manage» всегда используется инфинитив с частицей to (manage to optimize).'
    },
    {
      id: 'gi-4',
      sentence: 'We decided to postpone _____ the experimental feature until Monday.',
      translation: 'Мы решили отложить деплой экспериментальной фичи до понедельника.',
      options: ['to deploy', 'deploy', 'deploying', 'deployed'],
      correctIndex: 2,
      ruleExplanation: 'После глагола «postpone» (откладывать) ставится герундий (postpone deploying).'
    }
  ],
  'reported-speech': [
    {
      id: 'rs-1',
      sentence: 'The architect explained that the distributed system _____ scale horizontally.',
      translation: 'Архитектор объяснил, что распределенная система будет масштабироваться горизонтально.',
      options: ['will', 'would', 'shall', 'is'],
      correctIndex: 1,
      ruleExplanation: 'При согласовании времен в косвенной речи (после explained) «will» переходит в «would».'
    },
    {
      id: 'rs-2',
      sentence: 'She said that the developers _____ already verified all accessibility rules.',
      translation: 'Она сказала, что разработчики уже проверили все правила доступности.',
      options: ['have', 'had', 'were', 'did'],
      correctIndex: 1,
      ruleExplanation: 'Present Perfect в прямой речи смещается в Past Perfect (had verified) в косвенной речи.'
    },
    {
      id: 'rs-3',
      sentence: 'Our scrum master asked _____ the team could finish the migration on time.',
      translation: 'Наш скрам-мастер спросил, сможет ли команда завершить миграцию вовремя.',
      options: ['that', 'whether', 'what', 'which'],
      correctIndex: 1,
      ruleExplanation: 'Для косвенных общих вопросов («ли») используются союзы whether или if.'
    },
    {
      id: 'rs-4',
      sentence: 'He told us that he _____ investigating the cache invalidation bug then.',
      translation: 'Он сказал нам, что тогда расследовал баг сброса кэша.',
      options: ['is', 'was', 'has been', 'will be'],
      correctIndex: 1,
      ruleExplanation: 'Present Continuous (is investigating) в косвенной речи сдвигается в Past Continuous (was investigating).'
    }
  ],
  'modal-deduction': [
    {
      id: 'md-1',
      sentence: 'The database cluster _____ be offline because the health endpoint returns 200 OK.',
      translation: 'Кластер базы данных не может быть оффлайн, так как эндпоинт проверки возвращает 200 OK.',
      options: ['must not', 'cannot', 'might not', 'should not'],
      correctIndex: 1,
      ruleExplanation: 'Логическая уверенность в невозможности («не может быть») выражается через «cannot» (can’t), а не must not.'
    },
    {
      id: 'md-2',
      sentence: 'The sudden CPU spike _____ be caused by an infinite loop in the worker thread.',
      translation: 'Внезапный скачок нагрузки на процессор, должно быть, вызван бесконечным циклом.',
      options: ['must', 'can', 'need', 'ought'],
      correctIndex: 0,
      ruleExplanation: 'Высокая степень логической уверенности («должно быть») выражается модальным глаголом «must».'
    },
    {
      id: 'md-3',
      sentence: 'The audit team _____ have detected unauthorized attempts in the logs earlier.',
      translation: 'Команда аудита, возможно, обнаружила несанкционированные попытки в логах ранее.',
      options: ['might', 'can', 'shall', 'would'],
      correctIndex: 0,
      ruleExplanation: 'Вероятностное предположение о прошлом строится через might/may/could + have + V3.'
    },
    {
      id: 'md-4',
      sentence: 'The deployment failed instantly; someone _____ have forgotten the environment variable.',
      translation: 'Деплой упал мгновенно; кто-то, должно быть, забыл переменную окружения.',
      options: ['must', 'should', 'can', 'will'],
      correctIndex: 0,
      ruleExplanation: 'Уверенный вывод о причине события в прошлом: must + have + V3 (must have forgotten).'
    }
  ],
  'phrasal-tech': [
    {
      id: 'pt-1',
      sentence: 'The DevOps engineer decided to _____ the broken container image immediately.',
      translation: 'DevOps-инженер решил немедленно откатить поврежденный образ контейнера.',
      options: ['roll back', 'roll up', 'back in', 'turn over'],
      correctIndex: 0,
      ruleExplanation: 'Фразовый глагол «roll back» в IT означает откатить изменения или версию к предыдущей стабильной.'
    },
    {
      id: 'pt-2',
      sentence: 'Our squad will _____ why the message queue is backing up this morning.',
      translation: 'Наша команда выяснит, почему очередь сообщений переполняется этим утром.',
      options: ['figure out', 'carry on', 'break in', 'put off'],
      correctIndex: 0,
      ruleExplanation: '«Figure out» означает разобраться, понять причину или найти решение проблемы.'
    },
    {
      id: 'pt-3',
      sentence: 'We need to _____ comprehensive load testing before the public launch.',
      translation: 'Нам нужно провести комплексное нагрузочное тестирование перед публичным запуском.',
      options: ['carry out', 'spin down', 'look after', 'give up'],
      correctIndex: 0,
      ruleExplanation: '«Carry out» означает провести или выполнить (испытания, аудит, исследование).'
    },
    {
      id: 'pt-4',
      sentence: 'The orchestrator can _____ ten new microservice instances in under five seconds.',
      translation: 'Оркестратор может поднять десять новых инстансов микросервиса менее чем за пять секунд.',
      options: ['spin up', 'shut off', 'cut down', 'fall back'],
      correctIndex: 0,
      ruleExplanation: '«Spin up» в облачной инженерии означает быстро запустить/поднять сервер или контейнер.'
    }
  ],
  'c1-inversion': [
    {
      id: 'inv-1',
      sentence: 'Seldom _____ we witnessed such an elegant architecture handle millions of sessions.',
      translation: 'Редко когда мы наблюдали, чтобы столь элегантная архитектура выдерживала миллионы сессий.',
      options: ['did', 'have', 'had', 'were'],
      correctIndex: 1,
      ruleExplanation: 'После отрицательного наречия «Seldom» в начале предложения требуется инверсия (have + we + V3).'
    },
    {
      id: 'inv-2',
      sentence: 'Hardly _____ the engineers merged the branch when the CI pipeline started.',
      translation: 'Едва инженеры слили ветку, как запустился CI-пайплайн.',
      options: ['did', 'have', 'had', 'were'],
      correctIndex: 2,
      ruleExplanation: 'Устойчивая конструкция инверсии: Hardly + had + подлежащее + V3 ... when.'
    },
    {
      id: 'inv-3',
      sentence: 'Not only _____ the team refactor the code, but they also cut latency in half.',
      translation: 'Команда не только отрефакторила код, но и сократила задержку вдвое.',
      options: ['did', 'does', 'has', 'was'],
      correctIndex: 0,
      ruleExplanation: 'Инверсия в Past Simple после «Not only»: Not only + did + подлежащее + V1.'
    },
    {
      id: 'inv-4',
      sentence: 'Never before _____ the monitoring system reported zero downtime for an entire year.',
      translation: 'Никогда прежде система мониторинга не отчитывалась о нулевом простое целый год.',
      options: ['has', 'did', 'was', 'is'],
      correctIndex: 0,
      ruleExplanation: 'После «Never before» с причастием V3 (reported) требуется инверсия Present Perfect: has + subject + V3.'
    }
  ],
  'c1-mixed-cond': [
    {
      id: 'mc-1',
      sentence: 'If we had adopted strict types two years ago, our codebase _____ far cleaner now.',
      translation: 'Если бы мы внедрили строгие типы два года назад, наш код был бы намного чище сейчас.',
      options: ['would be', 'would have been', 'will be', 'was'],
      correctIndex: 0,
      ruleExplanation: 'Mixed Conditional: прошлое условие (had adopted) -> результат в настоящем («now»): would + V1 (would be).'
    },
    {
      id: 'mc-2',
      sentence: 'I wish we _____ the legacy encryption algorithm before the architect left.',
      translation: 'Жаль, что мы не задокументировали устаревший алгоритм шифрования до ухода архитектора.',
      options: ['documented', 'had documented', 'would document', 'have documented'],
      correctIndex: 1,
      ruleExplanation: 'Сожаление о прошлом после «I wish» всегда выражается через Past Perfect (had documented).'
    },
    {
      id: 'mc-3',
      sentence: 'If the server _____ under heavy load right now, the benchmark would have finished already.',
      translation: 'Если бы сервер не был под высокой нагрузкой сейчас, бенчмарк бы уже завершился.',
      options: ['is not', 'were not', 'had not been', 'would not be'],
      correctIndex: 1,
      ruleExplanation: 'Смешанный тип: нереальное настоящее условие («right now») использует Past Subjunctive (were not).'
    },
    {
      id: 'mc-4',
      sentence: 'If she had not taken that systems design course, she _____ leading the team today.',
      translation: 'Если бы она не прошла тот курс системного дизайна, она бы не возглавляла команду сегодня.',
      options: ['would not be', 'would not have been', 'is not', 'will not be'],
      correctIndex: 0,
      ruleExplanation: 'Прошлое условие + текущий длительный результат («today»): would not be + V-ing.'
    }
  ],
  'c1-cleft-sentences': [
    {
      id: 'cs-1',
      sentence: 'It was the memory allocation bottleneck _____ caused the drop in throughput.',
      translation: 'Именно узкое место выделения памяти вызвало падение пропускной способности.',
      options: ['what', 'that', 'where', 'whom'],
      correctIndex: 1,
      ruleExplanation: 'Классическое It-cleft предложение строится по формуле: It + be + выделяемый элемент + that/who.'
    },
    {
      id: 'cs-2',
      sentence: '_____ distinguishes a great systems engineer is the ability to anticipate failure modes.',
      translation: 'Что отличает выдающегося системного инженера, так это умение предвидеть сбои.',
      options: ['That', 'Which', 'What', 'It'],
      correctIndex: 2,
      ruleExplanation: 'Wh-cleft предложение начинается с «What» (= «то, что...»): What distinguishes ... is ...'
    },
    {
      id: 'cs-3',
      sentence: 'All _____ the migration script needs is a valid connection string.',
      translation: 'Все, что нужно скрипту миграции, — это валидная строка подключения.',
      options: ['what', 'that', 'which', 'who'],
      correctIndex: 1,
      ruleExplanation: 'В эмфатической конструкции «All that ... is ...» после all используется союз that (или опускается), но не what.'
    },
    {
      id: 'cs-4',
      sentence: 'It was only after running the profiler _____ we spotted the hidden deadlock.',
      translation: 'Лишь после запуска профайлера мы заметили скрытый дедлок.',
      options: ['when', 'that', 'which', 'what'],
      correctIndex: 1,
      ruleExplanation: 'В расщепленных конструкциях с «It was only after...» в качестве связки всегда используется «that».'
    }
  ]
}

export const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'def-1',
    sentence: 'The system _____ smoothly since the latest optimization patch was applied.',
    translation: 'Система работает плавно с тех пор, как был применен последний патч оптимизации.',
    options: ['has been running', 'ran', 'is running', 'runs'],
    correctIndex: 0,
    ruleExplanation: 'Предлог «since» указывает на действие, начавшееся в прошлом и длящееся до сих пор (Present Perfect Continuous).'
  },
  {
    id: 'def-2',
    sentence: 'By the time the users noticed, the team _____ already executed the rollback.',
    translation: 'К тому моменту как пользователи заметили, команда уже выполнила откат.',
    options: ['had', 'has', 'was', 'did'],
    correctIndex: 0,
    ruleExplanation: 'Действие, предшествующее другому моменту в прошлом («By the time ... noticed»), требует Past Perfect (had executed).'
  },
  {
    id: 'def-3',
    sentence: 'Every pull request must _____ by at least two senior engineers before merging.',
    translation: 'Каждый пулл-реквест должен быть проверен минимум двумя сеньор-инженерами перед слиянием.',
    options: ['review', 'be reviewed', 'reviewing', 'been reviewed'],
    correctIndex: 1,
    ruleExplanation: 'Пассивный залог после модального глагола must: must + be + V3 (be reviewed).'
  }
]
