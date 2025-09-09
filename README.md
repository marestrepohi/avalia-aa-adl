# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/544f1754-4846-48a8-abd0-c02022b64565

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/544f1754-4846-48a8-abd0-c02022b64565) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Casos de Uso Principales (Use Cases)

> Esta sección enfatiza para qué sirve realmente la plataforma y cómo cada módulo aporta valor. 

### 1. Asistentes de IA Personalizados
- Crear y gestionar asistentes (tabla `assistants`).
- Configurar: nombre, descripción, modelo (Gemini), temperatura e instrucciones del sistema.
- Actualización en vivo desde la interfaz (`Asistentes` + panel de edición).

### 2. Chat Conversacional Inteligente
- Interacción en tiempo real con un asistente seleccionado (`AsistenteChat`).
- Persistencia de conversaciones y mensajes (`conversations`, `messages`).
- Edge Function `chat-assistant` agrega contexto e invoca Google Gemini.
- Soporte para histórico limitado (últimos 20 mensajes) optimizando coste/latencia.
- Mensajes de ejemplo “sample-*” para onboarding sin costo de modelo.

### 3. Segmentación y Audiencias (Módulo en progreso)
- Vista de `Audiencias` orientada a definir grupos de clientes para campañas.
- Potencial integración con reglas y atributos dinámicos (pendiente de implementación de backend).

### 4. Campañas Inteligentes
- Formularios (`CampaignForm`, `AudienciasForm`) para orquestar campañas.
- Futuro: disparar workflows y medir impacto (actualmente UI base).

### 5. Analítica de Clientes y Valor
- Dashboards: Churn, Top Customers (`tc`), Next Best Action (`nba`), Aumento de Uso.
- Objetivo: soporte a decisiones comerciales y retención.

### 6. Soporte y Autoservicio
- Asistente “Soporte Cliente” preparado para FAQs / troubleshooting guiado.
- Escalable a clasificación de tickets y priorización.

### 7. Ventas y Cross/Up-Selling
- Asistente “Asistente Ventas” ofrece respuestas sobre productos financieros y recomendaciones.
- Base para incluir scoring o propensión en el futuro.

### 8. Asesoría Financiera / Inversiones
- Asistente “Asesor Inversiones” (estado inactivo inicial) configurado para análisis de productos.
- Puede evolucionar a RAG con documentos regulatorios.

### 9. Enriquecimiento Documental (Planeado)
- Componente `FuentesDocumentos` reservado para subir / vincular fuentes (RAG).
- Próximo paso: indexación (vectores) y retrieval contextual.

### 10. Experimentos de Experiencia (POC Screen Share)
- Subproyecto `my-screen-share-app` como prueba de captura de pantalla + audio.
- Puede integrarse para co-asistencia o soporte guiado.

## Mapa de Arquitectura (Alto Nivel)

```
UI (React + shadcn) 
	│
	├─ Hooks (useAssistants) → Supabase JS Client
	│           │
	│           ├─ Tablas: assistants / conversations / messages (RLS)
	│           └─ Edge Function: chat-assistant (Deno) → Google Gemini API
	│
	└─ (Futuro) Módulo RAG: Ingesta → Embeddings Store → Contextualización
```

## Ejemplos de Flujos Clave

1. Enviar mensaje al asistente:
	- Usuario escribe → `AsistenteChat` dispara `sendMessage()` → Edge Function → Gemini → guarda respuesta → UI actualiza.
2. Crear nuevo asistente:
	- Formulario (pendiente) / Seed inicial → Insert en `assistants` → visible en grid.
3. Activar conversación ejemplo:
	- Selección “sample-*” → carga mensajes mock sin llamar modelo.

## Roadmap Sugerido (Próximos Pasos)
| Prioridad | Feature | Objetivo |
|-----------|---------|----------|
| Alta | Autenticación real Supabase | Control de acceso y métricas por usuario |
| Alta | Consolidar migraciones | Evitar drift y limpieza histórica |
| Media | Índices BD (assistant_id, conversation_id) | Escalabilidad |
| Media | React Query para datos | Caché y manejo de estados | 
| Media | RAG (FuentesDocumentos) | Respuestas basadas en contexto documental |
| Baja | Streaming Gemini | Mejor UX en respuestas largas |
| Baja | Rate limiting / métricas | Control de coste y abuso |

## Métricas de Éxito (KPI de Casos de Uso)
- Tiempo medio de primera respuesta (ms).
- Conversaciones por asistente / día.
- Mensajes promedio por conversación.
- Uso de asistentes inactivos → detectar abandono.
- % conversaciones “ejemplo” vs reales (onboarding effectiveness).

---
Si necesitas que prepare documentación extendida para alguno de estos casos de uso (p.ej. “Cómo extender a RAG”), pídelo y lo añadimos.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/544f1754-4846-48a8-abd0-c02022b64565) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
