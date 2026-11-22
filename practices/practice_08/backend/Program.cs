using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Enable CORS for frontend development
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors();

// In-Memory Database / Store
var topics = new List<GrammarTopic>
{
    new("pres-perf", "present perfect vs past simple", "B1", 
        "разница между результатом в настоящем и завершенным действием в прошлом",
        [
            new("s1", "she has already completed this difficult engineering report on time and the lead architect has verified all database schema changes with the entire team", "она уже завершила этот сложный инженерный отчёт вовремя и главный архитектор проверил все изменения схемы базы данных со всей командой", "already указывает на результат в настоящем have или has плюс v3"),
            new("s2", "they went to the international tech conference in berlin last tuesday and presented their new automated deployment pipeline to many distributed backend developers", "они поехали на международную технологическую конференцию в берлин в прошлый вторник и представили свой новый автоматизированный пайплайн деплоя разработчикам", "last tuesday указывает на конкретный момент в прошлом past simple"),
            new("s3", "we have never observed such an innovative microservice architecture before in any enterprise software system because the latency was always extremely low", "мы никогда раньше не наблюдали столь инновационной микросервисной архитектуры ни в одной корпоративной системе потому что задержка была низкой", "never в контексте жизненного опыта до настоящего момента present perfect"),
            new("s4", "the core team launched our new cloud service two weeks ago and we have monitored every transaction continuously without any major production incident", "основная команда запустила наш новый облачный сервис две недели назад и мы непрерывно отслеживаем каждую транзакцию без каких либо инцидентов", "ago требует past simple а непрерывный мониторинг до настоящего времени present perfect"),
            new("s5", "have you ever refactored a legacy distributed system under high workload and maintained complete backward compatibility with all external client applications", "вы когда нибудь рефакторили легаси распределенную систему под высокой нагрузкой и сохраняли полную обратную совместимость с внешними приложениями", "ever в вопросе о жизненном опыте требует present perfect")
        ]),

    new("cond-2", "second and third conditionals", "B2", 
        "нереальные условия в настоящем и прошлом без знаков препинания",
        [
            new("c1", "if i had more free time during the working week i would learn three modern programming languages simultaneously and build high performance web applications", "если бы у меня было больше свободного времени на рабочей неделе я бы учил три языка программирования одновременно и создавал быстрые приложения", "второй тип условных предложений нереальное настоящее if плюс past simple would плюс v1"),
            new("c2", "if we had deployed the database migration yesterday the unexpected production incident would not have occurred and the system would be completely stable today", "если бы мы развернули миграцию базы данных вчера непредвиденного инцидента на проде не произошло бы и система была бы стабильна сегодня", "третий тип условных предложений сожаление о прошлом if плюс had v3 would have v3"),
            new("c3", "she would travel around the world if she worked remotely as a senior engineer and had sufficient balance to support long journeys across different continents", "она бы путешествовала по миру если бы работала удаленно сеньор инженером и имела достаточный баланс для долгих поездок по разным континентам", "второй тип условных предложений воображаемая ситуация в настоящем"),
            new("c4", "if they had thoroughly tested all edge cases before the deployment the automated release would have succeeded without any manual intervention from engineers", "если бы они тщательно протестировали все граничные случаи перед деплоем автоматический релиз прошел бы успешно без ручного вмешательства инженеров", "третий тип условных предложений гипотетическое прошлое if плюс had v3")
        ]),

    new("pass-voice", "passive voice in tech contexts", "B1", 
        "страдательный залог объект действия важнее исполнителя",
        [
            new("p1", "all critical microservices are monitored continuously by our automated observability stack and incident reports are delivered immediately to engineers on call", "все критические микросервисы непрерывно мониторятся нашим стеком наблюдаемости и отчеты об инцидентах доставляются дежурным инженерам", "present simple passive are monitored are delivered"),
            new("p2", "the automated integration tests were executed before the pull request was merged into the main development branch by the release manager yesterday afternoon", "автоматические интеграционные тесты были выполнены до того как пулл реквест был слит в основную ветку разработки релиз менеджером вчера днём", "past simple passive were executed was merged"),
            new("p3", "all authentication tokens must be kept confidential by every team member so that unauthorized access to private user records is completely prevented at all times", "все токены аутентификации должны храниться в тайне каждым членом команды чтобы несанкционированный доступ к записям был предотвращен", "modal passive must be kept is prevented")
        ]),

    new("rel-clauses", "defining and non defining relative clauses", "B2", 
        "придаточные определительные предложения со словами who which that",
        [
            new("r1", "the software architect who designed our event driven distributed system received an international award and gave an inspiring lecture on system reliability", "архитектор по который спроектировал нашу событийно ориентированную систему получил международную премию и прочитал вдохновляющую лекцию", "defining relative clause со словом who"),
            new("r2", "docker containers which isolate operating system processes enhance reproducible deployment pipelines and speed up local developer environments everywhere", "контейнеры докер которые изолируют процессы операционной системы улучшают воспроизводимость пайплайнов и ускоряют среду разработки", "relative clause со словом which")
        ]),

    new("a1-basics", "present simple and daily routines", "A1", 
        "базовые утверждения отрицания и вопросы о повседневных привычках",
        [
            new("a1", "she writes clean and readable code every single morning and then reviews pull requests submitted by other software engineers across the development company", "она пишет чистый и читаемый код каждое утро а затем проверяет пулл реквесты отправленные другими инженерами компании", "present simple третье лицо единственное число writes reviews"),
            new("a2", "we always drink fresh hot coffee before our first engineering standup meeting and discuss our daily tasks and upcoming release milestones together as a team", "мы всегда пьем свежий горячий кофе перед первым инженерным стендапом и обсуждаем наши ежедневные задачи и цели релиза вместе", "present simple с наречием частотности always drink discuss"),
            new("a3", "our development team does not ignore software accessibility guidelines because every modern web application must be convenient for all people around the world", "наша команда разработки не игнорирует руководства по доступности по потому что каждое приложение должно быть удобным для всех людей", "отрицание в present simple does not ignore")
        ]),

    new("past-continuous", "past continuous vs past simple", "A2",
        "параллельные и прерванные действия в прошлом без пунктуации",
        [
            new("pc1", "while the backend engineer was deploying the microservice to production the automated pipeline detected a sudden memory leak", "пока бэкенд инженер развертывал микросервис на проде автоматический пайплайн обнаружил внезапную утечку памяти", "длительное действие в прошлом was deploying прервано кратким detected"),
            new("pc2", "they were discussing the new database schema when the lead architect received an urgent notification from the monitor server", "они обсуждали новую схему базы данных когда ведущий архитектор получил срочное уведомление с сервера мониторинга", "past continuous were discussing с союзом when и past simple received"),
            new("pc3", "we were investigating the latency drop all evening yesterday while client applications were experiencing slow response times", "мы расследовали падение задержки весь вчерашний вечер в то время как клиентские приложения испытывали медленный отклик", "два параллельных длительных действия с союзом while were investigating were experiencing")
        ]),

    new("future-forms", "future forms will going to present continuous", "B1",
        "разница между спонтанными решениями планами и точными договоренностями",
        [
            new("ff1", "our engineering team is going to rewrite the legacy authentication module during the next development sprint in march", "наша команда инженеров собирается переписать устаревший модуль аутентификации во время следующего спринта разработки в марте", "намерение и заранее спланированное решение is going to rewrite"),
            new("ff2", "the cloud server is running out of memory so the automated orchestrator will spin up two additional worker instances soon", "на облачном сервере заканчивается память поэтому оркестратор вскоре запустит два дополнительных экземпляра воркеров", "спонтанное решение или логический прогноз will spin up"),
            new("ff3", "we are meeting with the product stakeholders tomorrow morning at ten oclock to review the quarterly roadmap milestones", "мы встречаемся со стейкхолдерами продукта завтра утром в десять часов чтобы обсудить ключевые этапы квартального роадмапа", "запланированная договоренность во времени present continuous are meeting")
        ]),

    new("modal-deduction", "modals of deduction must cannot might", "B2",
        "выражение уверенности и предположений в настоящем и прошлом",
        [
            new("md1", "the distributed database cluster cannot be offline because the health check endpoint is responding with status two hundred ok", "распределенный кластер базы данных не может быть оффлайн так как эндпоинт проверки здоровья отвечает статусом двести", "уверенность в невозможности действия cannot be"),
            new("md2", "the unexpected spike in cpu workload must be caused by an infinite loop in the background synchronization worker thread", "неожиданный скачок нагрузки на процессор должно быть вызван бесконечным циклом в фоновом потоке синхронизации", "логическая уверенность в причине происходящего must be caused"),
            new("md3", "the security audit team might have detected unauthorized access attempts in the network traffic logs earlier this afternoon", "команда аудита безопасности возможно обнаружила попытки несанкционированного доступа в логах сетевого трафика сегодня днем", "предположение о действии в прошлом might have detected")
        ]),

    new("phrasal-tech", "essential phrasal verbs in software engineering", "B2",
        "ключевые фразовые глаголы в разработке и системной инженерии",
        [
            new("pv1", "the devops engineer decided to roll back the broken container image and spin up the previous stable release immediately", "девопс инженер решил откатить поврежденный образ контейнера и немедленно запустить предыдущий стабильный релиз", "фразовые глаголы roll back откатить и spin up запустить контейнер"),
            new("pv2", "our development squad will figure out why the message queue is backing up and sort out all bottleneck queries this morning", "наш отряд разработки выяснит почему очередь сообщений переполняется и разберется с узкими местами этим утром", "figure out понять выяснить и sort out устранить проблему"),
            new("pv3", "we need to carry out comprehensive load testing before we roll out the new payment gateway integration to all active customers", "нам необходимо провести комплексное нагрузочное тестирование перед тем как выкатить новую интеграцию платежного шлюза", "carry out проводить испытания и roll out развертывать релиз")
        ]),

    new("c1-inversion", "advanced inversion and fronting", "C1",
        "эмфатическая инверсия порядка слов после отрицательных наречий",
        [
            new("inv1", "seldom have we witnessed such an elegant software architecture handle millions of concurrent user sessions with zero downtime", "редко когда мы наблюдали столь элегантную архитектуру программного обеспечения выдерживающую миллионы сессий без простоев", "инверсия после seldom вспомогательный глагол have перед подлежащим we"),
            new("inv2", "hardly had the engineers merged the feature branch when the continuous integration pipeline executed all regression test suites", "едва только инженеры слили ветку фичи как пайплайн непрерывной интеграции запустил все регрессионные тесты", "конструкция hardly had v3 when с обратным порядком слов"),
            new("inv3", "not only did the development team refactor the legacy codebase but they also reduced the overall server latency by half", "команда разработки не только провела рефакторинг легаси кода но и сократила общую задержку сервера вдвое", "инверсия с not only did they refactor")
        ]),

    new("reported-speech", "reported speech in technical discussions", "B1",
        "косвенная речь и согласование времен в командных обсуждениях",
        [
            new("rs1", "the lead architect explained that the distributed system would scale horizontally once the cache invalidation bug was fixed", "главный архитектор объяснил что распределенная система будет масштабироваться по горизонтали как только баг будет исправлен", "согласование времен в косвенной речи will переходит в would"),
            new("rs2", "she said that the frontend developers had already verified all accessibility guidelines before submitting the pull request", "она сказала что фронтенд разработчики уже проверили все правила доступности перед отправкой пулл реквеста", "предшествующее действие в косвенной речи past perfect had verified"),
            new("rs3", "our scrum master asked whether the engineering team could complete the database migration before the scheduled maintenance window", "наш скрам мастер спросил сможет ли команда завершить миграцию базы данных до запланированного окна обслуживания", "косвенный вопрос со словом whether и модальным could")
        ]),

    new("a1-articles", "articles a an the and zero article", "A1",
        "определенный неопределенный и нулевой артикль в повседневной речи",
        [
            new("art1", "an experienced developer always writes a clear commit message before pushing the changes to the remote repository", "опытный разработчик всегда пишет понятное сообщение коммита перед отправкой изменений в удаленный репозиторий", "an перед гласным звуком experienced a перед согласным the для конкретных изменений"),
            new("art2", "the laptop on the wooden desk has an aluminum body and runs a fast linux distribution for daily software development", "ноутбук на деревянном столе имеет алюминиевый корпус и работает на быстрой сборке линукс для ежедневной разработки", "the для конкретного предмета на столе an aluminum body"),
            new("art3", "clean code is essential for software engineering because programmers spend hours reading documentation every week", "чистый код необходим для программной инженерии так как программисты тратят часы на чтение документации каждую неделю", "нулевой артикль перед неисчисляемыми и обобщенными понятиями software engineering documentation")
        ]),

    new("a2-prepositions", "prepositions of time and place in on at", "A2",
        "точное употребление предлогов времени и места в рабочих ситуациях",
        [
            new("prep1", "our sprint planning meeting starts at nine oclock on monday morning in the main glass conference room", "наше планирование спринта начинается в девять часов в понедельник утром в главной стеклянной переговорной", "at с точным временем on с днями недели in с помещениями"),
            new("prep2", "the security patch was released in november on the fifteenth day right at midnight without any service downtime", "патч безопасности был выпущен в ноябре пятнадцатого числа ровно в полночь без простоя сервиса", "in с месяцами on с конкретными датами at midnight"),
            new("prep3", "she works at a fintech startup in london and usually reviews architecture diagrams on the train ride home", "она работает в финтех стартапе в лондоне и обычно просматривает схемы архитектуры в поезде по дороге домой", "at с организацией in с городом on the train с общественным транспортом")
        ]),

    new("b1-gerund-inf", "gerund vs infinitive after verbs", "B1",
        "когда после глагола ставить форму с ing а когда инфинитив с to",
        [
            new("gi1", "we decided to postpone deploying the experimental feature because the team wanted to avoid introducing subtle race conditions", "мы решили отложить деплой экспериментальной фичи потому что команда хотела избежать появления тонких состояний гонки", "decide to v1 postpone plus ving avoid plus ving"),
            new("gi2", "the senior engineer suggested refactoring the authentication middleware before attempting to integrate the third party oauth provider", "сеньор инженер предложил отрефакторить прослойку аутентификации перед попыткой интегрировать стороннего провайдера", "suggest plus ving attempt to v1"),
            new("gi3", "she managed to optimize the sql query by indexing the primary columns and stopped running expensive full table scans", "она сумела оптимизировать запрос проиндексировав основные столбцы и прекратила выполнять дорогие полные сканирования таблиц", "manage to v1 stop plus ving прекратить действие")
        ]),

    new("c1-mixed-cond", "mixed conditionals and wish clauses", "C1",
        "смешанные условные предложения связь прошлого с настоящим и сожаления",
        [
            new("mc1", "if we had adopted strict type safety two years ago our production codebase would be far more maintainable right now", "если бы мы внедрили строгую типизацию два года назад наша кодовая база была бы гораздо более поддерживаемой прямо сейчас", "смешанный тип if плюс had v3 прошлое и would v1 результат в настоящем"),
            new("mc2", "i wish we had documented the legacy encryption algorithm thoroughly before the original systems architect left the company", "жаль что мы не задокументировали устаревший алгоритм шифрования подробно до ухода первоначального системного архитектора", "wish плюс past perfect had documented сожаление о прошлом"),
            new("mc3", "if the core server were not under heavy load right now the benchmark suite would have finished ten minutes ago", "если бы основной сервер не был под высокой нагрузкой сейчас набор бенчмарков завершился бы десять минут назад", "смешанный тип постоянное условие в настоящем if were и результат в прошлом would have v3")
        ]),

    new("c1-cleft-sentences", "cleft sentences and academic emphasis", "C1",
        "расщепленные предложения it is that и what is для смыслового акцента",
        [
            new("cs1", "it was the memory allocation bottleneck that caused the sudden drop in throughput during the peak black friday traffic", "именно узкое место выделения памяти вызвало внезапное падение пропускной способности во время пикового трафика", "расщепленное предложение it was x that для усиления фокуса на причине"),
            new("cs2", "what distinguishes a great systems engineer from an average coder is the ability to anticipate hidden failure modes", "что отличает выдающегося системного инженера от обычного кодера так это способность предвидеть скрытые сценарии сбоев", "what cleft sentence what distinguishes ... is ..."),
            new("cs3", "all that the migration script needs is a valid connection string and read only permissions on the staging replica", "все что нужно скрипту миграции это валидная строка подключения и права на чтение для тестовой реплики", "эмфатическая конструкция all that ... is ...")
        ])
};

var userStatsHistory = new List<SessionStats>
{
    new("init-1", "pres-perf", 68, 98.2, 2, 102, ["p", "r"], DateTime.UtcNow.AddDays(-1)),
    new("init-2", "pass-voice", 74, 99.0, 1, 88, ["t"], DateTime.UtcNow.AddHours(-4))
};

var vocabularyList = new List<VocabularyWord>
{
    new("v1", "thoroughly", "тщательно, основательно", "/ˈθʌr.ə.li/", "adverb", 2, "https://api.dictionaryapi.dev/media/pronunciations/en/thoroughly-uk.mp3"),
    new("v2", "occurrence", "явление, происшествие", "/əˈkʌr.əns/", "noun", 3, "https://api.dictionaryapi.dev/media/pronunciations/en/occurrence-uk.mp3"),
    new("v3", "simultaneously", "одновременно, синхронно", "/ˌsɪm.əlˈteɪ.ni.əs.li/", "adverb", 1, "https://api.dictionaryapi.dev/media/pronunciations/en/simultaneously-us.mp3"),
    new("v4", "confidential", "конфиденциальный, секретный", "/ˌkɒn.fɪˈden.ʃəl/", "adjective", 0, "https://api.dictionaryapi.dev/media/pronunciations/en/confidential-uk.mp3")
};

var leaderboard = new List<LeaderboardEntry>
{
    new("lb-1", "alex_speed", 104, 99.4, "present perfect vs past simple", "B1", DateTime.UtcNow.AddHours(-2)),
    new("lb-2", "elena_code", 96, 98.8, "second and third conditionals", "B2", DateTime.UtcNow.AddHours(-5)),
    new("lb-3", "cyber_typer", 88, 97.5, "passive voice in tech contexts", "B1", DateTime.UtcNow.AddDays(-1)),
    new("lb-4", "dev_master", 82, 99.0, "present simple and daily routines", "A1", DateTime.UtcNow.AddDays(-2)),
    new("lb-5", "ninja_keys", 78, 96.2, "defining and non defining relative clauses", "B2", DateTime.UtcNow.AddDays(-3)),
    new("lb-6", "swift_finger", 74, 98.1, "present perfect vs past simple", "B1", DateTime.UtcNow.AddDays(-4)),
    new("lb-7", "touch_pro", 70, 95.9, "present simple and daily routines", "A1", DateTime.UtcNow.AddDays(-5))
};

// Helper: builds a MusicSubtitle with proportional word-level timings aligned to verified LRC boundaries
MusicSubtitleLine MakeSub(int id, double start, double end, string textEn, string textRu)
{
    var tokens = textEn.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    var weights = tokens.Select(w => Math.Max(2.0, w.Length + 1.5)).ToArray();
    var totalWeight = weights.Sum();
    var duration = Math.Max(0.4, end - start);
    var words = new List<SubtitleWord>(tokens.Length);
    var cursor = start;
    for (int i = 0; i < tokens.Length; i++)
    {
        var wDur = duration * (weights[i] / totalWeight);
        var wEnd = i == tokens.Length - 1 ? end : Math.Round(cursor + wDur, 2);
        words.Add(new SubtitleWord(tokens[i], Math.Round(cursor, 2), wEnd));
        cursor = wEnd;
    }
    return new MusicSubtitleLine(id, start, end, textEn, textRu, words);
}

var musicLessons = new List<MusicLesson>
{
    new(
        "queen-champions",
        "We Are the Champions",
        "Queen",
        "B1",
        "https://www.youtube.com/embed/04854XqcfCY",
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
        "Present Perfect vs Past Simple, gerunds and colloquial contractions",
        [
            MakeSub(1, 10.0, 18.1, "i have paid my dues time after time", "я платил по счетам снова и снова"),
            MakeSub(2, 18.1, 25.8, "i have done my sentence but committed no crime", "я отбыл свой срок но не совершал преступления"),
            MakeSub(3, 25.8, 33.6, "and bad mistakes i have made a few", "и тяжких ошибок я совершил немного"),
            MakeSub(4, 33.6, 44.1, "i have had my share of sand kicked in my face but i have come through", "мне тоже швыряли песок в лицо но я выстоял"),
            MakeSub(5, 44.1, 51.4, "we are the champions my friends", "мы чемпионы друзья мои"),
            MakeSub(6, 51.4, 59.3, "and we will keep on fighting till the end", "и мы продолжим бороться до конца"),
            MakeSub(7, 59.3, 66.9, "we are the champions we are the champions", "мы чемпионы мы чемпионы"),
            MakeSub(8, 66.9, 77.5, "no time for losers because we are the champions of the world", "не время для проигравших потому что мы чемпионы мира")
        ],
        [
            new("Present Perfect for Life Experience", "i have paid my dues time after time", "have paid (V3) выражает жизненный опыт до момента речи с фокусом на результат в настоящем.", "present-perfect"),
            new("Past Simple for Definite Events", "i have done my sentence but committed no crime", "committed в Past Simple выражает завершенное действие в прошлом в контрасте с Present Perfect.", "past-simple"),
            new("Keep on + Gerund", "we will keep on fighting till the end", "фразовый глагол keep on в сочетании с герундием fighting означает непрерывное продолжение действия.", "phrasal-verbs"),
            new("Colloquial Contraction", "no time for losers because we are the champions", "в песне часто используется 'cause как разговорное сокращение от because.", "informal-english")
        ],
        [
            new("qc-1", "i have paid my dues time after time and i have done my sentence but committed no crime", "я платил по счетам снова и снова и я отбыл свой срок но не совершал преступления", "контраст present perfect have paid и past simple committed"),
            new("qc-2", "and bad mistakes i have made a few i have had my share of sand kicked in my face", "и тяжких ошибок я совершил немного мне тоже швыряли песок в лицо", "present perfect have made have had для жизненного опыта"),
            new("qc-3", "we are the champions my friends and we will keep on fighting till the end", "мы чемпионы друзья мои и мы продолжим бороться до конца", "keep on fighting конструкция продолжения действия"),
            new("qc-4", "we are the champions no time for losers because we are the champions of the world", "мы чемпионы не время для проигравших потому что мы чемпионы мира", "утвердительные конструкции и ритм песни")
        ]
    ),
    new(
        "coldplay-scientist",
        "The Scientist",
        "Coldplay",
        "B1",
        "https://www.youtube.com/embed/RB-RcX5DS5A",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
        "Infinitive of purpose, modal verbs and expressions of regret",
        [
            MakeSub(1, 31.0, 36.5, "come up to meet you tell you i am sorry", "прийти чтобы встретиться с тобой сказать что мне жаль"),
            MakeSub(2, 36.5, 44.3, "you do not know how lovely you are", "ты даже не знаешь насколько ты прекрасна"),
            MakeSub(3, 44.3, 50.5, "i had to find you tell you i need you", "я должен был найти тебя сказать что ты мне нужна"),
            MakeSub(4, 50.5, 57.2, "tell you i set you apart", "сказать что ты для меня особенная"),
            MakeSub(5, 57.2, 63.6, "tell me your secrets and ask me your questions", "открой мне свои секреты и задай свои вопросы"),
            MakeSub(6, 63.6, 70.7, "oh let us go back to the start", "давай вернемся к самому началу"),
            MakeSub(7, 70.7, 76.7, "running in circles coming up tails", "бежим по кругу выпадает решка"),
            MakeSub(8, 76.7, 83.1, "heads on a science apart", "головы погружены в отдельную науку"),
            MakeSub(9, 83.1, 96.2, "nobody said it was easy it is such a shame for us to part", "никто не говорил что будет легко так жаль что нам пришлось расстаться")
        ],
        [
            new("Infinitive of Purpose", "come up to meet you tell you i am sorry", "Инфинитив с частицей to (to meet, to tell) указывает на цель действия: зачем пришёл.", "infinitive"),
            new("Modal Verb of Obligation in Past", "i had to find you tell you i need you", "had to это форма прошедшего времени от must/have to выражающая внешнюю необходимость.", "modals"),
            new("Phrasal Verb Set Apart", "tell you i set you apart", "set apart означает выделять кого-то, считать особенным среди всех.", "phrasal-verbs"),
            new("Impersonal Construction", "it is such a shame for us to part", "it is such a shame выражает сожаление и сочувствие по поводу ситуации.", "constructions")
        ],
        [
            new("cs-1", "come up to meet you tell you i am sorry you do not know how lovely you are", "прийти чтобы встретиться с тобой сказать что мне жаль ты не знаешь как ты прекрасна", "infinitive of purpose to meet you to tell you"),
            new("cs-2", "i had to find you tell you i need you tell you i set you apart", "я должен был найти тебя сказать что ты мне нужна сказать что ты особенная", "had to прошедшее время от must"),
            new("cs-3", "tell me your secrets and ask me your questions oh let us go back to the start", "открой мне свои секреты и задай вопросы давай вернемся к началу", "повелительное наклонение tell me let us go back"),
            new("cs-4", "nobody said it was easy it is such a shame for us to part", "никто не говорил что будет легко так жаль что нам приходится расстаться", "согласование времен nobody said it was easy")
        ]
    ),
    new(
        "beatles-yesterday",
        "Yesterday",
        "The Beatles",
        "A2",
        "https://www.youtube.com/embed/NrgmdOz227I",
        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
        "Past Simple, Used to and contrast with present",
        [
            MakeSub(1, 4.0, 11.6, "yesterday all my troubles seemed so far away", "вчера все мои невзгоды казались такими далекими"),
            MakeSub(2, 11.6, 16.5, "now it looks as though they are here to stay", "теперь кажется будто они останутся навсегда"),
            MakeSub(3, 16.5, 22.0, "oh i believe in yesterday", "о я верю во вчерашний день"),
            MakeSub(4, 22.0, 29.2, "suddenly i am not half the man i used to be", "вдруг я больше не тот человек кем был раньше"),
            MakeSub(5, 29.2, 34.1, "there is a shadow hanging over me", "надо мной нависла тень"),
            MakeSub(6, 34.1, 39.2, "oh yesterday came suddenly", "о вчерашний день ушел внезапно"),
            MakeSub(7, 39.2, 47.5, "why she had to go i do not know she would not say", "почему она должна была уйти я не знаю она не сказала"),
            MakeSub(8, 47.5, 56.0, "i said something wrong now i long for yesterday", "я сказал что то не так теперь я тоскую по вчерашнему дню")
        ],
        [
            new("Past Simple for Past States", "all my troubles seemed so far away", "seemed правильный глагол в Past Simple указывает на состояние в прошлом.", "past-simple"),
            new("Used to for Past Habits or States", "i am not half the man i used to be", "used to выражает состояние или привычку в прошлом которая больше не актуальна в настоящем.", "used-to"),
            new("As Though / As If", "it looks as though they are here to stay", "as though используется для описания того как что-то выглядит или кажется.", "conjunctions")
        ],
        [
            new("by-1", "yesterday all my troubles seemed so far away now it looks as though they are here to stay", "вчера все невзгоды казались далекими теперь кажется будто они здесь навсегда", "past simple seemed в контрасте с настоящим looks"),
            new("by-2", "suddenly i am not half the man i used to be there is a shadow hanging over me", "вдруг я больше не тот кем был раньше надо мной нависла тень", "конструкция used to для прошлых состояний"),
            new("by-3", "why she had to go i do not know she would not say i said something wrong", "почему она должна была уйти я не знаю она не сказала я сказал что-то не то", "косвенный вопрос why she had to go и модальный would")
        ]
    )
};

// ----------------- API ENDPOINTS -----------------

// 1. Get all topics or filter by CEFR level
app.MapGet("/api/topics", (string? level) =>
{
    var result = string.IsNullOrWhiteSpace(level) 
        ? topics 
        : topics.Where(t => t.Level.Equals(level, StringComparison.OrdinalIgnoreCase)).ToList();

    return Results.Ok(result.Select(t => new
    {
        t.Id,
        t.Title,
        t.Level,
        t.Description,
        SentenceCount = t.Sentences.Count
    }));
});

// 2. Get lesson sentences for a topic
app.MapGet("/api/lessons/{topicId}", (string topicId) =>
{
    var topic = topics.FirstOrDefault(t => t.Id == topicId);
    if (topic == null)
    {
        return Results.NotFound(new { error = $"Topic '{topicId}' not found." });
    }

    return Results.Ok(new
    {
        topic.Id,
        topic.Title,
        topic.Level,
        topic.Description,
        Sentences = topic.Sentences
    });
});

// 3. Adaptive lesson targeting user's weak keys
app.MapGet("/api/adaptive/weak-keys", (string? keys) =>
{
    var targetKeys = (keys ?? "r,t,p")
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .Select(k => k.ToLowerInvariant())
        .ToHashSet();

    // Find sentences with the highest density of target keys
    var allSentences = topics.SelectMany(t => t.Sentences).ToList();
    var scored = allSentences
        .Select(s => new
        {
            Sentence = s,
            MatchCount = s.English.Count(c => targetKeys.Contains(char.ToLowerInvariant(c).ToString()))
        })
        .OrderByDescending(x => x.MatchCount)
        .Take(4)
        .Select(x => x.Sentence)
        .ToList();

    return Results.Ok(new
    {
        Id = "adaptive-weak-keys",
        Title = $"Адаптивная тренировка слабых букв: [{string.Join(", ", targetKeys.Select(k => k.ToLowerInvariant()))}]",
        Level = "Adaptive",
        Description = "Фразы с максимальной концентрацией ваших проблемных клавиш для тренировки мышечной памяти.",
        Sentences = scored
    });
});

// 4. Save session results
app.MapPost("/api/stats", (SessionStatsRequest request) =>
{
    if (request.Wpm < 0 || request.Accuracy < 0 || request.Accuracy > 100)
    {
        return Results.BadRequest(new { error = "Некорректные метрики скорости или точности." });
    }

    var record = new SessionStats(
        Guid.NewGuid().ToString("N")[..8],
        request.TopicId,
        request.Wpm,
        request.Accuracy,
        request.Errors,
        request.DurationSeconds,
        request.WeakKeys ?? [],
        DateTime.UtcNow
    );

    userStatsHistory.Add(record);

    return Results.Created($"/api/stats/{record.Id}", new
    {
        success = true,
        recordId = record.Id,
        message = "Статистика успешно сохранена в профиле."
    });
});

// 5. Get aggregate statistics
app.MapGet("/api/stats", () =>
{
    if (userStatsHistory.Count == 0)
    {
        return Results.Ok(new
        {
            totalSessions = 0,
            avgWpm = 0.0,
            avgAccuracy = 0.0,
            totalErrors = 0,
            weakKeysFrequency = new Dictionary<string, int>()
        });
    }

    var totalSessions = userStatsHistory.Count;
    var avgWpm = Math.Round(userStatsHistory.Average(s => s.Wpm), 1);
    var avgAccuracy = Math.Round(userStatsHistory.Average(s => s.Accuracy), 1);
    var totalErrors = userStatsHistory.Sum(s => s.Errors);

    var weakKeyFreq = userStatsHistory
        .SelectMany(s => s.WeakKeys)
        .GroupBy(k => k.ToLowerInvariant())
        .ToDictionary(g => g.Key, g => g.Count());

    return Results.Ok(new
    {
        totalSessions,
        avgWpm,
        avgAccuracy,
        totalErrors,
        weakKeysFrequency = weakKeyFreq,
        recentSessions = userStatsHistory.OrderByDescending(s => s.Timestamp).Take(5).ToList()
    });
});

// 6. Vocabulary of hard words
app.MapGet("/api/vocabulary", () => Results.Ok(vocabularyList));

app.MapPost("/api/vocabulary", (AddWordRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Word) || string.IsNullOrWhiteSpace(request.Translation))
    {
        return Results.BadRequest(new { error = "Слово и перевод обязательны для заполнения." });
    }

    var existing = vocabularyList.FirstOrDefault(v => v.Word.Equals(request.Word.Trim(), StringComparison.OrdinalIgnoreCase));
    if (existing != null)
    {
        existing.MistakeCount++;
        return Results.Ok(existing);
    }

    var newWord = new VocabularyWord(
        Guid.NewGuid().ToString("N")[..8],
        request.Word.Trim().ToLowerInvariant(),
        request.Translation.Trim(),
        request.Phonetic ?? "/.../",
        request.PartOfSpeech ?? "word",
        1,
        request.AudioUrl
    );

    vocabularyList.Add(newWord);
    return Results.Created($"/api/vocabulary/{newWord.Id}", newWord);
});

app.MapDelete("/api/vocabulary/{id}", (string id) =>
{
    var word = vocabularyList.FirstOrDefault(w => w.Id == id);
    if (word == null) return Results.NotFound();
    vocabularyList.Remove(word);
    return Results.NoContent();
});

// 7. AI Grammar & Translation verification endpoint
app.MapPost("/api/check-translation", (CheckTranslationRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.UserText))
    {
        return Results.BadRequest(new { error = "Текст не может быть пустым." });
    }

    var expected = request.ExpectedText.Trim().ToLowerInvariant().TrimEnd('.', '!', '?');
    var actual = request.UserText.Trim().ToLowerInvariant().TrimEnd('.', '!', '?');

    bool isExact = expected == actual;
    int levenshtein = ComputeLevenshtein(expected, actual);
    double similarity = Math.Max(0, 1.0 - (double)levenshtein / Math.Max(expected.Length, actual.Length));

    string feedback;
    if (isExact)
    {
        feedback = "Идеально! Грамматическая конструкция использована абсолютно верно.";
    }
    else if (similarity > 0.85)
    {
        feedback = "Отлично! Небольшая опечатка в символах, но грамматика верна.";
    }
    else
    {
        feedback = $"Обратите внимание на конструкцию: эталонный вариант «{request.ExpectedText}». Попробуйте ещё раз.";
    }

    return Results.Ok(new
    {
        isCorrect = similarity >= 0.85,
        similarity = Math.Round(similarity * 100, 1),
        feedback,
        grammarTip = request.GrammarTip ?? "Следите за временами глаголов и порядком слов."
    });
});

// 10. Get leaderboard
app.MapGet("/api/leaderboard", (string? level) =>
{
    var query = string.IsNullOrWhiteSpace(level) || level.Equals("all", StringComparison.OrdinalIgnoreCase)
        ? leaderboard
        : leaderboard.Where(e => e.Level.Equals(level, StringComparison.OrdinalIgnoreCase)).ToList();

    var sorted = query.OrderByDescending(e => e.Wpm).ThenByDescending(e => e.Accuracy).ToList();
    return Results.Ok(sorted);
});

// 11. Submit entry to leaderboard
app.MapPost("/api/leaderboard", (LeaderboardRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.UserName) || request.UserName.Trim().Length < 2)
    {
        return Results.BadRequest(new { error = "Имя пользователя должно содержать не менее 2 символов." });
    }

    if (request.Wpm <= 0 || request.Accuracy < 0 || request.Accuracy > 100)
    {
        return Results.BadRequest(new { error = "Некорректные параметры скорости или точности." });
    }

    var entry = new LeaderboardEntry(
        Guid.NewGuid().ToString("N")[..8],
        request.UserName.Trim(),
        request.Wpm,
        request.Accuracy,
        string.IsNullOrWhiteSpace(request.TopicTitle) ? "тренировка" : request.TopicTitle,
        string.IsNullOrWhiteSpace(request.Level) ? "B1" : request.Level,
        DateTime.UtcNow
    );

    leaderboard.Add(entry);
    return Results.Created($"/api/leaderboard/{entry.Id}", entry);
});

// 12. Music & Video Lessons with Subtitles, Grammar Breakdown and Lyrics Typing
app.MapGet("/api/music-lessons", () => Results.Ok(musicLessons.Select(m => new
{
    m.Id,
    m.Title,
    m.Artist,
    m.Level,
    m.ThumbnailUrl,
    m.GrammarFocus,
    SentenceCount = m.TypingSentences.Count
})));

app.MapGet("/api/music-lessons/{id}", (string id) =>
{
    var lesson = musicLessons.FirstOrDefault(m => m.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
    return lesson != null ? Results.Ok(lesson) : Results.NotFound(new { error = $"Music lesson '{id}' not found." });
});

app.Run();

// Helper Levenshtein distance
static int ComputeLevenshtein(string a, string b)
{
    if (string.IsNullOrEmpty(a)) return b?.Length ?? 0;
    if (string.IsNullOrEmpty(b)) return a.Length;

    int[,] d = new int[a.Length + 1, b.Length + 1];
    for (int i = 0; i <= a.Length; i++) d[i, 0] = i;
    for (int j = 0; j <= b.Length; j++) d[0, j] = j;

    for (int i = 1; i <= a.Length; i++)
    {
        for (int j = 1; j <= b.Length; j++)
        {
            int cost = a[i - 1] == b[j - 1] ? 0 : 1;
            d[i, j] = Math.Min(
                Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                d[i - 1, j - 1] + cost
            );
        }
    }
    return d[a.Length, b.Length];
}

// ----------------- DATA RECORDS -----------------

public record GrammarTopic(
    string Id, 
    string Title, 
    string Level, 
    string Description, 
    List<SentenceItem> Sentences
);

public record SentenceItem(
    string Id, 
    string English, 
    string Russian, 
    string GrammarTip
);

public record SessionStats(
    string Id, 
    string TopicId, 
    double Wpm, 
    double Accuracy, 
    int Errors, 
    int DurationSeconds, 
    List<string> WeakKeys, 
    DateTime Timestamp
);

public record SessionStatsRequest(
    string TopicId, 
    double Wpm, 
    double Accuracy, 
    int Errors, 
    int DurationSeconds, 
    List<string>? WeakKeys
);

public record VocabularyWord(
    string Id, 
    string Word, 
    string Translation, 
    string Phonetic, 
    string PartOfSpeech, 
    int MistakeCount, 
    string? AudioUrl
) {
    public int MistakeCount { get; set; } = MistakeCount;
}

public record AddWordRequest(
    string Word, 
    string Translation, 
    string? Phonetic, 
    string? PartOfSpeech, 
    string? AudioUrl
);

public record CheckTranslationRequest(
    string ExpectedText, 
    string UserText, 
    string? GrammarTip
);

public record LeaderboardEntry(
    string Id,
    string UserName,
    double Wpm,
    double Accuracy,
    string TopicTitle,
    string Level,
    DateTime Timestamp
);

public record LeaderboardRequest(
    string UserName,
    double Wpm,
    double Accuracy,
    string TopicTitle,
    string Level
);

public record SubtitleWord(
    string Word,
    double Start,
    double End
);

public record MusicSubtitleLine(
    int Id,
    double StartSeconds,
    double EndSeconds,
    string TextEn,
    string TextRu,
    List<SubtitleWord>? Words = null
);

public record GrammarBreakdownItem(
    string RuleTitle,
    string LyricQuote,
    string Explanation,
    string GrammarTag
);

public record MusicLesson(
    string Id,
    string Title,
    string Artist,
    string Level,
    string VideoUrl,
    string ThumbnailUrl,
    string GrammarFocus,
    List<MusicSubtitleLine> Subtitles,
    List<GrammarBreakdownItem> GrammarBreakdown,
    List<SentenceItem> TypingSentences
);
