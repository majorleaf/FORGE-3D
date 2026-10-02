generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
}



// ── 2. Upsert user in DB ───────────────────────────────
await prisma.user.upsert({
  where:  { id: user.id },
  update: {},
  create: {
    id:    user.id,
    email: user.email!,
  },
})

const response = await hf.chatCompletion({
  model:  'mistralai/Mistral-7B-Instruct-v0.3',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userPrompt },
  ],
  max_tokens:  512,
  temperature: 0.2,
})

const code = response.choices[0].message.content?.trim() ?? ''