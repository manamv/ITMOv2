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
