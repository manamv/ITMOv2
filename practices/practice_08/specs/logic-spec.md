# Logic & Architecture Specification (Команда Backend / Logic)

* **Фреймворк:** Spec-Kit (SDD)
* **Проект:** LinguaType (Практика 8)
* **Статус:** `APPROVED`

---

## 1. Доменные модели и сущности

### 1.1. `GrammarTopic` & `SentenceItem`
```csharp
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
```

### 1.2. `SessionStats` & `VocabularyWord`
```csharp
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

public record VocabularyWord(
    string Id,
    string Word,
    string Translation,
    string Phonetic,
    string PartOfSpeech,
    int MistakeCount,
    string? AudioUrl
);
```

---

## 2. Математические формулы и метрики

### 2.1. Расчет скорости набора (WPM — Words Per Minute)
По международному стандарту тайпинга 1 условное слово = 5 напечатанным символам:
$$\text{WPM} = \frac{\text{длина набранных символов} / 5}{\text{время в секундах} / 60}$$

### 2.2. Расчет точности (Accuracy)
$$\text{Accuracy (\%)} = \max\left(0, \frac{\text{всего нажатий} - \text{опечатки}}{\text{всего нажатий}} \times 100\%\right)$$

---

## 3. Алгоритм адаптивного трекинга слабых клавиш (Weak Keys)

1. Для каждого нажатия клавиши $k$ фиксируется счетчик правильных нажатий $h_k$ и опечаток $e_k$.
2. Клавиша признается **проблемной (Weak Key)**, если выполнены условия:
   $$h_k \ge 3 \quad \text{и} \quad \frac{e_k}{h_k} \ge 0.12 \quad (12\%)$$
3. **Генератор адаптивного урока:**
   * Получает на вход массив проблемных букв $\{k_1, k_2, \dots, k_m\}$.
   * Вычисляет плотность совпадений в базе предложений:
     $$\text{Score}(S) = \sum_{c \in S} \mathbb{I}[c \in \text{WeakKeys}]$$
   * Ранжирует предложения по убыванию `Score` и формирует персональный спринт.

---

## 4. Архитектура озвучки (Sound & TTS Pipeline)

* **Для полных предложений:**
  * Используется браузерный **Web Speech API** (`SpeechSynthesisUtterance`).
  * Приоритетный селектор голосов ищет нативные Neural/Natural голоса (`Google US English`, `Microsoft Natural`, `Samantha`, `Daniel`).
  * Темп речи зафиксирован на значении $0.95$ для максимальной четкости артикуляции звуков.
* **Для отдельных слов из словаря:**
  * Запрос к свободному словарному API (`https://api.dictionaryapi.dev/api/v2/entries/en/{word}`) возвращает студийный MP3-файл произношения от носителей языка (UK/US).
  * При отсутствии сети или сбое воспроизведения плеер автоматически переключается на fallback через Web Speech API.

---

## 5. Защита от повторной отправки (Double-Submit Protection)

* **Клиентский уровень:**
  1. При вызове отправки взводится атомарный флаг `submitLockRef.current = true`.
  2. Устанавливается React-состояние `isSubmitting = true`.
  3. Кнопки отправки получают атрибут `disabled={isSubmitting}`.
  4. Повторные клики и нажатия `Enter` во время выполнения промиса отбрасываются.
* **Серверный уровень:**
  1. Метод `POST /api/stats` валидирует входные параметры ($WPM \ge 0, 0 \le Accuracy \le 100$).
  2. Генерируется уникальный `recordId`, гарантирующий идемпотентность операции.
