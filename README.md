##Overview

The uta‑copilot‑c53b8046 repository is a full‑stack implementation of UTA Copilot, an intelligent campus assistant for the University of Texas at Arlington. It comprises a React/TypeScript front‑end backed by Supabase for authentication and data storage, and a FastAPI back‑end (located in the apps/api folder) that exposes additional endpoints for chat heuristics, speech‑to‑text transcription and calendar file generation. The front‑end uses Vite and Tailwind CSS with Capacitor configuration to enable deployment as a mobile app.

Top‑level layout
Path	Description
.env / .gitignore	environment variables and ignore patterns
package.json, vite.config.ts, tailwind.config.ts	build tooling for a Vite + React + Tailwind project
public/	static files (favicon, placeholder SVG)
src/	front‑end code (React components, pages, hooks and utilities)
supabase/	SQL migrations and seeded data for Supabase
apps/api/	FastAPI back‑end exposing health, chat and calendar endpoints
Front‑end architecture
Application entry point

src/main.tsx bootstraps the React app. It uses createRoot to mount the app and wraps it in a BrowserRouter for routing. It imports global styles from index.css
raw.githubusercontent.com
.

src/App.tsx is the root component. It listens to the Supabase auth state and conditionally renders routes: unauthenticated users are directed to an Index page (/auth), and authenticated users access the hero page (/hero) or feature pages such as dining and events
raw.githubusercontent.com
. When the user’s session is loading, a splash screen is shown.
raw.githubusercontent.com
.

Pages

The src/pages directory defines full‑screen views:

Page file	Purpose
Hero.tsx	Main landing page after login. It features a 3‑D star‑field using React Three Fiber and a floating menu. The menu allows users to start a new chat, open campus map, view events, find dining options, or open the about page. It also allows signing out via Supabase Auth
raw.githubusercontent.com
. Rotating informational lines highlight UTA Copilot’s capabilities (discover campus events, get directions, explore services, etc.)
raw.githubusercontent.com
.
DiningPage.tsx	Displays campus dining locations and menus. It fetches data from Supabase (tables dining_locations and menus) and shows open/closed status and menu highlights.
EventsPage.tsx	Lists upcoming events. It queries the events table, grouping events by date and labeling them as today, tomorrow or a formatted date.
AboutPage.tsx	Provides information about the project and its creators.
DataSetupPage.tsx	A data ingestion interface (likely for administrators) that uploads CSV/ICS or manual entries into Supabase.
Core components

ChatInterface – A sophisticated chat window that supports both text and voice input. It maintains a list of messages, displays typing indicators and suggestions, and integrates with several hooks. The component uses a helper function to format links and emails
raw.githubusercontent.com
 and uses multiAgentCoordinator to process queries and return responses. Voice input is handled by the useVoiceInterface hook; text‑to‑speech output is provided via useTextToSpeech
raw.githubusercontent.com
. The chat also supports follow‑up suggestions and command palette to trigger specific actions (navigation, reminders, etc.).

FloatingVoiceButton – A button floating on the page that toggles voice recognition and shows live captions. It uses hooks from useVoiceInterface and useRealtimeVoice.

CampusMap – A 3‑D/2‑D map component that renders UTA buildings and allows the user to get directions to a selected building. It likely integrates with the navigation agent.

AboutSection, ExploreSection, Footer and other presentational components – Provide additional information sections used on the hero or about pages.

Custom UI – The app defines its own button, input, card, toast and chat bubble components styled with Tailwind and Framer Motion.

Hooks and utilities

The codebase defines a series of React hooks under src/hooks that encapsulate complex behaviours:

Hook	Responsibility
useConversationMemory	Generates a unique session ID and stores chat messages in the Supabase conversation_history table. It provides methods to load and persist conversation history, retrieve recent context and compute topic summaries
raw.githubusercontent.com
raw.githubusercontent.com
.
useSentiment	Wraps the sentiment npm library to classify text as positive, neutral or negative and prepend empathetic phrases to responses accordingly
raw.githubusercontent.com
.
useTextToSpeech / useVoiceInterface / useRealtimeVoice	Orchestrate speech synthesis and recognition using Web Speech API. They handle audio recording, send the audio to the backend for transcription, and manage live captions.
useRealtimeData	Subscribes to Supabase’s real‑time channels to receive updates about dining or events tables.
useToast and use-mobile	Provide toast notifications and responsive UI behaviours.

Utility modules under src/utils implement a multi‑agent system and voice recorder:

agents.ts defines the navigation agent and reminder agent. The NavigationAgent opens directions to campus buildings by creating a Google Maps URL and clicking a temporary link; it also attempts to match building names using a dictionary
raw.githubusercontent.com
. The ReminderAgent schedules browser notifications or opens a Google Calendar link to remind users of events; it rejects reminders for past dates and stores reminders in localStorage
raw.githubusercontent.com
. The AgentRouter inspects queries for navigation or reminder patterns and returns the appropriate agent and parameters
raw.githubusercontent.com
.

specialized‑agents.ts implements domain‑specific agents: a DiningAgent queries dining_locations and menus tables in Supabase and constructs a status and menu summary
raw.githubusercontent.com
; an AcademicAgent searches courses, faculty (via a secure edge function) and programs, returning information about courses and professors
raw.githubusercontent.com
; an EventAgent fetches upcoming events from the events table, groups them by date and labels them relative to today or tomorrow
raw.githubusercontent.com
; a ServiceAgent responds to common campus‑service questions about Wi‑Fi, parking, library and IT support using static information
raw.githubusercontent.com
.

multi‑agent‑coordinator.ts orchestrates these agents. It scores each agent’s ability to handle a query (canHandle), then chooses a processing strategy: single (run only the highest‑scoring agent), parallel (run several agents concurrently when multiple intents are detected) or cascade (try agents in descending order until a high‑confidence response is obtained)
raw.githubusercontent.com
. It records performance metrics and has logic for multi‑intent queries
raw.githubusercontent.com
.

VoiceRecorder.ts handles recording audio from the microphone and converting it to a File for upload to the back‑end.

Supabase integration

The file src/integrations/supabase/client.ts instantiates the Supabase client using a publishable key and persistent session configuration
raw.githubusercontent.com
. The types.ts file, automatically generated from the Supabase schema, defines TypeScript types for all database tables (such as dining_locations, events, courses, programs, conversation_history, etc.)
raw.githubusercontent.com
. These types ensure type‑safe queries throughout the code.

Supabase serves several roles in the application:

Authentication – App.tsx listens for auth state changes and routes the user accordingly
raw.githubusercontent.com
. Hero.tsx provides a sign‑out function using supabase.auth.signOut()
raw.githubusercontent.com
.

Data storage – Tables such as conversation_history, dining_locations, events, courses, programs, menus and profiles store persistent data used by agents and pages. The useConversationMemory hook writes chat history to Supabase
raw.githubusercontent.com
.

Real‑time updates – The useRealtimeData hook can subscribe to changes in dining or events tables to update UI automatically.

Back‑end (FastAPI)

The back‑end resides in apps/api. It exposes a small set of endpoints primarily used for the voice interface and fallback chat heuristics:

Endpoint	Description
/health	Returns a simple {"ok": true} with a timestamp to indicate the server is running
raw.githubusercontent.com
.
/chat	Accepts a list of messages (user and assistant) and heuristically determines whether to fetch campus events, dining information or cost estimates. It uses an fetch_events function that downloads the campus iCal feed, caches results for 5 minutes and returns upcoming events
raw.githubusercontent.com
. It contains a stub fetch_dining_today function and a fetch_average_cost function. If the query doesn’t match any heuristic, it replies with “I need to think…” and instructs the user to check again later
raw.githubusercontent.com
.
/stt	Handles speech‑to‑text. It accepts an uploaded audio file, calls OpenAI’s Whisper API using an API key, and returns the transcribed text. Temporary files are cleaned up after use and the route returns an error if transcription fails
raw.githubusercontent.com
.
/calendar/create	Creates an .ics file for calendar events. It takes event details (title, start/end times, optional location), uses the ics library to build a calendar object, saves it under the ./data directory and returns a URL. Another route, /calendar/{fname}, serves the generated file
raw.githubusercontent.com
raw.githubusercontent.com
.

The requirements.txt file lists the Python dependencies: fastapi, uvicorn[standard], httpx, ics, openai and python‑multipart
raw.githubusercontent.com
.

Architectural flow

User interaction – When a user signs in (via Supabase), they reach the hero page. A floating voice button or chat interface collects queries.

Front‑end processing – The chat interface records messages and calls multiAgentCoordinator.processQuery() to choose which specialized agents should handle the query. Agents such as DiningAgent or EventAgent query Supabase and return a structured response (text plus optional data). For navigation or reminders, the system uses browser APIs or opens external links (Google Maps or Calendar).

Voice transcription – If the user speaks, the useVoiceInterface hook records audio and sends it to the back‑end’s /stt endpoint. The back‑end uses OpenAI Whisper to return text, which is then processed by the multi‑agent system.

Data persistence – Conversation history and user data are stored in Supabase. Real‑time tables (events, dining) are updated and subscribed to by the front‑end for live updates.

Backend heuristics – For fallback or offline scenarios, the back‑end’s /chat endpoint can provide simple responses about events or dining using cached or stub data. However, the front‑end primarily relies on Supabase and specialized agents for responses.

Conclusion

UTA Copilot is a sophisticated campus assistant that combines a modern React front‑end, a multi‑agent system, real‑time Supabase integration and a FastAPI back‑end. The front‑end offers voice and text interaction, 3‑D visual flair, and dynamic pages for dining and events. The back‑end provides fallback heuristics, speech transcription and calendar file generation. A multi‑agent coordinator intelligently routes queries to specialized agents that access campus dining, academic, event and service information stored in Supabase. Together, these components deliver a comprehensive digital assistant tailored to the UTA campus.
