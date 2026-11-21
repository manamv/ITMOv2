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
    new("pres-perf", "Present Perfect vs Past Simple", "B1", 
        "Разница между результатом в настоящем (have/has + V3) и завершённым действием в прошлом.",
        [
            new("s1", "She has already completed this difficult report on time.", "Она уже завершила этот сложный отчёт вовремя.", "already указывает на результат в настоящем"),
            new("s2", "They went to the conference in Berlin last Tuesday.", "Они поехали на конференцию в Берлин в прошлый вторник.", "last Tuesday — конкретный момент в прошлом, Past Simple"),
            new("s3", "I have never seen such an innovative software architecture before.", "Я никогда раньше не видел столь инновационной архитектуры ПО.", "never в контексте жизненного опыта — Present Perfect"),
            new("s4", "We launched our new web application two months ago.", "Мы запустили наше новое веб-приложение два месяца назад.", "ago требует Past Simple"),
            new("s5", "Have you ever refactored a legacy distributed system?", "Вы когда-нибудь рефакторили легаси распределенную систему?", "ever — опыт до настоящего момента")
        ]),

    new("cond-2", "Second & Third Conditionals", "B2", 
        "Нереальные условия в настоящем (If + Past Simple, would + V) и прошлом (If + Past Perfect, would have + V3).",
        [
            new("c1", "If I had more time, I would learn three programming languages simultaneously.", "Если бы у меня было больше времени, я бы учил три языка программирования одновременно.", "2nd conditional: воображаемое настоящее"),
            new("c2", "If we had deployed the database migration yesterday, the production incident would not have occurred.", "Если бы мы развернули миграцию БД вчера, инцидента на проде не произошло бы.", "3rd conditional: сожаление о прошлом"),
            new("c3", "She would travel around the world if she worked remotely as a senior engineer.", "Она бы путешествовала по миру, если бы работала удаленно сеньор-инженером.", "2nd conditional"),
            new("c4", "If they had tested all edge cases, the automated release would have succeeded.", "Если бы они протестировали все граничные случаи, автоматический релиз был бы успешен.", "3rd conditional")
        ]),

    new("pass-voice", "Passive Voice in Tech Contexts", "B1", 
        "Страдательный залог: объект действия важнее исполнителя (be + V3).",
        [
            new("p1", "The microservices are monitored continuously by our automated observability stack.", "Микросервисы непрерывно мониторятся нашим стеком наблюдаемости.", "Present Simple Passive"),
            new("p2", "All unit and integration tests were executed before the pull request was merged.", "Все юнит и интеграционные тесты были выполнены до слияния пулл-реквеста.", "Past Simple Passive"),
            new("p3", "Security tokens must be kept confidential by every team member.", "Токены безопасности должны сохраняться в тайне каждым членом команды.", "Modal Passive")
        ]),

    new("rel-clauses", "Defining & Non-defining Relative Clauses", "B2", 
        "Придаточные определительные предложения (who, which, that, whose).",
        [
            new("r1", "The architect who designed our event-driven system received an international award.", "Архитектор, который спроектировал нашу событийно-ориентированную систему, получил международную премию.", "Defining relative clause"),
            new("r2", "Docker containers, which isolate system processes, enhance reproducible deployment pipelines.", "Docker-контейнеры, изолирующие системные процессы, улучшают воспроизводимость пайплайнов деплоя.", "Non-defining: дополнительная информация")
        ]),

    new("a1-basics", "Present Simple & Daily Routines", "A1", 
        "Базовые утверждения, отрицания и вопросы о повседневных привычках и фактах.",
        [
            new("a1", "She writes clean and readable code every single morning.", "Она пишет чистый и читаемый код каждое утро.", "Present Simple 3rd person singular (-s)"),
            new("a2", "Do you drink fresh coffee before your first engineering standup meeting?", "Ты пьёшь свежий кофе перед первым инженерным стендапом?", "Вопрос в Present Simple"),
            new("a3", "Our team does not ignore software accessibility guidelines.", "Наша команда не игнорирует руководства по доступности ПО.", "Отрицание: does not + V1")
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
        Title = $"Адаптивная тренировка слабых букв: [{string.Join(", ", targetKeys.Select(k => k.ToUpperInvariant()))}]",
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
