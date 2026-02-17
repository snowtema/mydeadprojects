# Research: Game-like Cemetery View (свободное размещение могил)

**Дата:** 2026-02-18
**Статус:** Approved, переходим к реализации
**Тип:** Feature Research & Analysis (FPF)

---

## Контекст

Текущее кладбище — статичный CSS-грид (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), одинаковый у всех пользователей. Предлагается заменить на 2D-поле со свободным размещением могил — как игровая механика, придающая проекту шарм и открывающая путь к монетизации.

---

## Конкурентный анализ

### Прямые аналоги (кладбища продуктов)

| Проект | Подход | Свободное размещение? |
|--------|--------|----------------------|
| Killed by Google | Грид карточек (React/Gatsby) | Нет |
| Microsoft Graveyard | Грид карточек | Нет |
| Google Cemetery | Грид карточек | Нет |

**Вывод:** ни один из аналогов не использует свободное 2D-размещение. Незанятая ниша.

### Вдохновение из других доменов

| Источник | Что берём |
|----------|-----------|
| **Graveyard Keeper** (игра) | Декорации вокруг могил (ограды, свечи, цветы) → монетизация. Качество могилы влияет на рейтинг |
| **r/place** (Reddit) | Коллаборативный 2D-canvas с миллионами пользователей. Архитектура: WebSocket + Redis + чанки |
| **Remember Metaverse** | NFT-могилы по 0.1 ETH. Виртуальные участки (LAND) как торгуемый актив |
| **PlotBox / Chronicle** | Профессиональный софт для кладбищ: вид сверху, клик по участку, zoom/pan |
| **WoW / FFXIV мемориалы** | Кладбища как социальные точки — люди возвращаются, оставляют реакции |

---

## Техническая оценка

### Подходы к реализации

| Подход | Технология | Сложность | Перф. лимит | Мобильная поддержка |
|--------|-----------|-----------|-------------|---------------------|
| **A. DOM + CSS absolute** | `react-zoom-pan-pinch` + `position: absolute` | Низкая | ~200-300 элементов | Из коробки |
| **B. Canvas 2D** | `react-konva` или `Konva` | Средняя | ~2000-5000 элементов | Встроена |
| **C. WebGL** | `PixiJS` | Высокая | 10000+ спрайтов при 60fps | Требует работы |
| **D. Infinite Canvas SDK** | `tldraw` | Средняя | Зависит от рендерера | Встроена |

### Выбран подход A (DOM + CSS) для MVP

**Почему:**
- Работает с существующим `TombstoneCard` без изменений
- 1 новая зависимость (`react-zoom-pan-pinch`, 700K+ weekly downloads)
- Минимальные изменения в схеме БД (добавить `x`, `y` nullable поля)
- Достаточно для ~200-300 могил на одном кладбище
- Pan/zoom/pinch на мобильных — из коробки

**Когда мигрировать на B/C:** только если на Explore-странице нужно отображать тысячи могил одновременно.

### Collision detection

AABB (Axis-Aligned Bounding Box): `a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y`

### LOD (уровни детализации при зуме)

- Далеко: точки с именами
- Средне: форма надгробия + имя + даты
- Близко: полная карточка с эпитафией и реакциями

---

## Монетизация (задел)

### Краткосрочная

| Модель | Описание | Усилия |
|--------|----------|--------|
| Стили надгробий | Готика, мрамор, пиксель-арт, неон, кибер | Средние |
| Декорации | Цветы, свечи, ограды, ангелы вокруг могилы | Средние |
| Премиум участки | Центр кладбища, под деревом, у озера | Низкие |

### Среднесрочная

| Модель | Описание | Усилия |
|--------|----------|--------|
| Тема кладбища | Полная смена визуала: жуткое, мирное, пиксельное, космическое | Высокие |
| Анимированные надгробия | Призраки, мерцающие свечи, эффекты погоды | Средние |
| Бейджи/достижения | "Serial Killer" (10+ проектов), "Necromancer" (воскресил проект) | Низкие |

### Долгосрочная

| Модель | Описание | Усилия |
|--------|----------|--------|
| Спонсированные могилы | Компании хоронят свои убитые продукты (платный листинг) | Низкие |
| Кладбищенский ландшафт | Деревья, дорожки, водоёмы — покупные элементы окружения | Высокие |

---

## Риски

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Перф на мобильных при >100 могил | Средняя | LOD + viewport culling |
| UX сложность размещения на тач | Средняя | Snap-to-grid (мягкая сетка 20px) + ghost preview |
| Обратная совместимость | Низкая | nullable поля + Grid как fallback |
| Пустое кладбище выглядит скучно | Высокая | Дефолтные декоративные элементы |
| Координаты ломаются при ресайзе | Средняя | Нормализованные координаты (0-1) вместо пикселей |

---

## Архитектурный план

### Изменения в схеме БД

```
projects: добавить
  - positionX: real (nullable)
  - positionY: real (nullable)
  - tombstoneStyle: varchar(50) (nullable, default "classic")
```

### Новые компоненты

```
graveyard-canvas.tsx      — 2D поле с pan/zoom
tombstone-placer.tsx      — режим размещения (ghost + collision)
graveyard-view-toggle.tsx — переключатель Grid ↔ Canvas
```

### Фазы

**Фаза 1 — MVP Canvas:** миграция БД, react-zoom-pan-pinch, рендер через position:absolute, click-to-place, drag, toggle Grid/Canvas
**Фаза 2 — Полировка:** LOD, мобильный UX, collision detection, визуальная земля
**Фаза 3 — Монетизация:** tombstoneStyle + варианты, декорации, система покупок

---

## Источники

- [Killed by Google](https://killedbygoogle.com/) / [GitHub](https://github.com/codyogden/killedbygoogle)
- [tldraw SDK](https://tldraw.dev/)
- [react-zoom-pan-pinch](https://github.com/BetterTyped/react-zoom-pan-pinch)
- [Konva.js](https://konvajs.org/)
- [PixiJS](https://pixijs.com/)
- [Graveyard Keeper Wiki](https://graveyardkeeper.fandom.com/wiki/Graveyard_Keeper_Wiki)
- [r/place Engineering](https://saikumarchintada.medium.com/engineering-behind-r-place-a7eb53bcf5f1)
- [MDN 2D Collision Detection](https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection)
- [PlotBox](https://plotbox.com/) / [Chronicle](https://chronicle.rip/)
- [Remember Metaverse NFT](https://nftevening.com/remember-metaverse-launches-worlds-first-virtual-cemetery-with-memorial-stone-nfts/)
