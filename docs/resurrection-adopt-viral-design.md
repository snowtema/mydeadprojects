# Resurrection/Adopt — Viral Feature Design (FPF Analysis)

## FPF Decomposition

| FPF Element | Mapping |
|---|---|
| **Holon** | Resurrection/Adopt как подсистема MDP-платформы |
| **BoundedContext** | Виральные механики социальных продуктов для dev-комьюнити |
| **MethodDescription** | Дизайн фичи (plan-time), НЕ имплементация |
| **Anomaly (B.5.2)** | Текущий viral loop однонаправленный (только "смерть"). Нет обратного цикла. |

---

## Anomaly Statement

**Текущий viral loop MDP:**
```
Create → Bury → Death Certificate → Share → "Хочу тоже!" → Register → Bury → Share
```

**Проблема:** Один цикл, одна эмоция (юмор + уязвимость). Пользователь заходит 1 раз, хоронит проекты, шарит, и — всё. Нет причины возвращаться. Нет второго витка.

**Аномалия:** Как создать ВТОРОЙ viral loop (resurrection), который усиливает первый и превращает платформу из "one-shot viral момент" в "recurring viral engine"?

---

## Hypothesis Generation (B.5.2.1 NQD-Generate)

### CharacteristicSpace (Q-метрики):
- **Q1**: Viral coefficient (shareability)
- **Q2**: Простота реализации
- **Q3**: Глубина вовлечения (retention)
- **Q4**: Network effect (создаёт связи между людьми?)

### Кандидаты:

| ID | Гипотеза | Q1 | Q2 | Q3 | Q4 | N | D |
|---|---|---|---|---|---|---|---|
| **h1** | **Adopt with Public Pledge** — "Усыновление" с Resurrection Certificate | HIGH | MED | HIGH | HIGH | MED | HIGH |
| **h2** | **Frankenstein Mode** — собери проект из "органов" мёртвых | MED | LOW | MED | LOW | HIGH | LOW |
| **h3** | **Resurrection Bounty** — награда за воскрешение | MED | MED | HIGH | MED | MED | MED |
| **h4** | **Necromancer Leaderboard** — бейджи и лидерборд | HIGH | HIGH | MED | LOW | MED | LOW |
| **h5** | **Ghost Mode** — анонимные "wishes" | LOW | HIGH | LOW | MED | MED | MED |
| **h6** | **Twin Flame** — матчинг "мёртвый проект ↔ разработчик" | HIGH | LOW | MED | MED | HIGH | MED |
| **h7** | **Zombie Challenge** — ивенты "воскреси за 48 часов" | HIGH | MED | HIGH | HIGH | HIGH | HIGH |

### Pareto front: **h1, h4, h7** доминируют.

### Plausibility Filters:
- **h2** (Frankenstein): слишком сложна, не генерирует shareable момент → drop
- **h5** (Ghost): слишком пассивна, нет share trigger → drop
- **h6** (Twin Flame): требует matching algorithm без достаточной базы → drop на MVP

### **Selected: Композит h1 + h4 + h7**

---

## The Resurrection System — Feature Design

### Actors & Roles

| Роль | Кто | Действие |
|---|---|---|
| **Gravedigger** | Владелец мёртвого проекта | Открывает проект для воскрешения |
| **Necromancer** | Тот, кто хочет воскресить | Усыновляет и воскрешает |
| **Witnesses** | Комьюнити | Голосуют, реагируют, расшаривают |

### Status Flow

```
dead  →  open_for_resurrection  →  adopted  →  resurrected
  ↑                                    ↓
  └──────────── dead_again ←──────────┘
```

---

## 6 Viral Share Triggers

Каждый trigger генерирует уникальный shareable артефакт (vs текущие 2):

### Trigger 1: "Seeking Necromancer"
Владелец отмечает проект как `resurrectable` → генерируется OG-карточка:
> *"My project [Name] is looking for a second chance. Will you be its Necromancer?"*

### Trigger 2: "Resurrection Pledge"
Некромант нажимает Adopt → пишет pledge (140 символов) → **Resurrection Certificate**:
> Две стороны: тёмная (эпитафия) | светлая (pledge)

### Trigger 3: "Adoption Confirmed"
Владелец одобряет → shareable момент:
> *"@gravedigger passed the torch to @necromancer. The resurrection begins."*

### Trigger 4: "It Lives!"
Некромант линкует новый repo/URL → статус = `resurrected` → **Resurrection Announcement**:
> Before/After: Death Certificate → alive. Confetti-анимация.

### Trigger 5: Badge Earned
Некромант получает бейдж → shareable achievement card.

### Trigger 6: "Press R to Resurrect"
Lightweight wish-механика. N wishes → "Most Wanted" → Ghost Ping владельцу.

---

## Triple Viral Loop

### LOOP A (existing) — Death Loop:
```
Bury → Death Certificate → Share → "Хочу тоже!" → Register → Bury → Share
```

### LOOP B (new) — Resurrection Loop:
```
Browse graves → Find project → Adopt → Resurrection Certificate → Share
  ↕ original owner shares too: "Кто-то воскресил мой проект!"
  → followers: "Хочу чтобы мой воскресили!" OR "Хочу воскресить!"
  → Register → either bury OR adopt
```

### LOOP C (amplifier) — Challenge Loop:
```
Weekly featured dead project → "Воскреси это за неделю!"
→ Participants share progress → Winner announced → Share results
→ "Хочу участвовать!" → Register
```

**Key Insight:** Loop B создаёт двустороннюю мотивацию — и Gravedigger, и Necromancer хотят шарить. Один adoption = два share events от разных людей в разные аудитории.

---

## Necromancer Identity System

### Бейджи

| Бейдж | Условие | GitHub Badge |
|---|---|---|
| **Apprentice** | 1 adoption (в процессе) | `🪦→🧟 Apprentice Necromancer` |
| **Necromancer** | 1 successful resurrection | `🧟 Necromancer: 1 revived` |
| **Dark Mage** | 3 resurrections | `🧙 Dark Mage: 3 revived` |
| **Lich King** | 10 resurrections | `👑 Lich King: 10 revived` |
| **Phoenix** | Resurrected your OWN project | `🔥 Phoenix: Self-resurrected` |

### Профиль
- Новая вкладка "Resurrections" рядом с "Graveyard"
- Leaderboard: "Top Necromancers" на Explore

---

## Psychological Triggers

| Триггер | Механика | Почему работает |
|---|---|---|
| **Hero Narrative** | "Я спас мёртвый проект" | Идентичность: я Некромант |
| **Gratitude** | Владелец благодарит adopter'а | Эмоциональная связь → оба шарят |
| **Competition** | Leaderboard некромантов | Status seeking → мотивация |
| **FOMO** | "Этот проект уже усыновлен!" | Scarcity → надо быстрее |
| **Reciprocity** | "Мой проект усыновили → я тоже" | Цепная реакция |
| **Surprise** | "Кто-то хочет МОЙ мёртвый проект?!" | Неожиданная валидация |
| **Social Proof** | "347 проектов уже воскрешены" | Нормализация + доверие |

---

## Virality Formula

**Текущая:**
```
Virality = Humor × Vulnerability × Visual (Death Certificate) × 1 loop
```

**С Resurrection:**
```
Virality = (Humor × Vulnerability × Visual) × (Hero Narrative × Gratitude × Competition)
         × 3 loops × 6 share triggers × 2-sided sharing
```

Оценка усиления: **x3–5 viral surface**.

---

## Implementation Phases

### Phase 1 — MVP (минимальный виральный loop):
- [ ] Toggle "Open for Resurrection" в настройках проекта
- [ ] Кнопка "Adopt" с текстом pledge
- [ ] Resurrection Certificate (OG-карточка)
- [ ] Нотификация владельцу
- [ ] Активация `status` field в БД
- [ ] Фильтр "Seeking Resurrection" на Explore
- [ ] "Press R" для resurrection wish

### Phase 2 — Engagement (глубина):
- [ ] Necromancer бейджи и секция профиля
- [ ] Resurrection Proof (линк на repo/URL)
- [ ] "Recently Resurrected" feed
- [ ] Ghost Ping нотификации
- [ ] Owner approval flow

### Phase 3 — Viral Amplifiers:
- [ ] Necromancer Leaderboard
- [ ] Weekly Resurrection Challenge
- [ ] Telegram: daily resurrection updates
- [ ] GitHub badge: Necromancer variant
- [ ] "Most Wanted" — проекты с наибольшим числом wishes

---

## Success Metrics

| Метрика | Target | Как измерить |
|---|---|---|
| **Resurrection Rate** | >5% проектов marked as resurrectable | DB query |
| **Adoption Rate** | >2% от просмотров resurrectable проектов | clicks / views |
| **Dual-Share Rate** | >40% adoptions где ОБА участника шарят | share events |
| **Necromancer Retention** | D7 >30% для adopter'ов | user activity tracking |
| **K-factor boost** | +0.3 к текущему K-factor | viral attribution |
