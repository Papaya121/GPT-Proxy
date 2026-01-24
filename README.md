# GPT Proxy (NestJS + OpenAI Streaming)

Минималистичный **GPT-proxy сервер на NestJS** с поддержкой:

- обычных ответов (JSON)
- **стриминга ответов (SSE)** в стиле OpenAI
- переключения режимов через `stream: true`

Проект написан с целью получать доступ к API ChatGPT из России, имея сервер в Германии

---

## Возможности

- NestJS + Express
- Официальный `openai` SDK
- SSE (Server-Sent Events)
- Валидация входных данных (DTO + class-validator)
- Один endpoint для stream / non-stream
- Подходит для `curl`, браузера, Node.js клиента

---

## Установка

```bash
git clone https://github.com/papaya121/gpt-proxy.git
cd gpt-proxy
npm install
```

Запуск:

```bash
npm run start
```

## Использование

Пример POST / запроса в корень сервера

```bash
{
  "input": [
    {
      "role": "system",
      "content": "Отвечай без Markdown"
    },
    {
      "role": "user",
      "content": "Что такое My Little Pony в 2-ух коротких предложениях."
    }
  ],

  "stream":false
}
```
