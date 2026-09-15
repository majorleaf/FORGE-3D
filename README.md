FORGE3D

Convert technical drawings and dimensions into production-ready 3D CAD models in seconds.

FORGE3D is an AI-powered 3D model generator aimed at mechanical engineers, CAD designers, and Blender artists. Instead of spending hours manually recreating precise structural models from technical drawings in SolidWorks or AutoCAD, FORGE3D takes exact dimensions and specifications, processes them through an LLM, and outputs deterministic, dimensionally accurate OpenSCAD code. The system then renders this code into downloadable STL, OBJ, or STEP files, skipping the inaccurate outputs of organic mesh models (like Shap-E) entirely.

This is a complete reimagining of AI 3D generation: we are treating 3D geometry as code.

The Core Problem & Solution

The Problem: Existing AI 3D tools (Shap-E, Point-E) generate organic, approximated point clouds or meshes. They are useless for a mechanical engineer who needs a bolt hole that is exactly 8mm in diameter, or a wall thickness of exactly 3mm.

The Solution: By using an LLM (e.g., Claude) to generate OpenSCAD code based on technical inputs, FORGE3D guarantees parametric, exact geometry. If you request a 50mm diameter, the generated code uses a 50mm diameter.

Architecture

FORGE3D utilizes a decoupled, async job processing architecture designed for long-running generative tasks, identical in pattern to standard background processing systems.

Tech Stack:

Frontend: Next.js, TypeScript, Tailwind CSS

Backend Orchestration: FastAPI (Python) or Next.js API Routes

Database: PostgreSQL (for usage logs, users, job states)

Caching/Queue: Redis (for job queues and pub/sub status updates)

Infrastructure: Docker & Docker Compose

AI/Generation Layer:

LLM API (Claude API / OpenAI API) for OpenSCAD code generation

OpenSCAD (CLI/Headless or WASM) for rendering code to STL

The Flow:

Input: User provides dimensions via a form, uploads a mechanical drawing (processed by Vision LLM), or types a precise text prompt (e.g., "Cylinder, diameter 50mm, height 120mm, wall thickness 3mm").

Submission (POST /api/jobs): The backend receives the input, saves a pending job to PostgreSQL, queues the task in Redis, and immediately returns a job_id (HTTP 202 Accepted).

Code Generation (Background): The worker picks up the job and sends the prompt to the LLM (e.g., Claude), asking for valid OpenSCAD syntax.

Rendering (Background): The worker passes the generated OpenSCAD code to the OpenSCAD engine, which compiles and renders it into a precise .stl or .obj file.

Polling (GET /api/jobs/:id): The frontend polls the backend every 2 seconds for the job status.

Delivery: Once complete, the status updates to done, and the frontend fetches and displays the precise mesh in a measurement-grid viewer, offering the file for download.

Key Features

Parametric Accuracy: Output is generated via code, ensuring dimensional precision impossible with diffusion-based 3D models.

Multiple Input Modes:

Form-based dimension input (Width, Height, Depth, Tolerances).

Text description ("M8 bolt, 40mm length").

Planned: Technical drawing upload via Vision LLMs.

Asynchronous Processing: Robust background job queue handling long API waits and rendering times without blocking the UI.

Precise 3D Viewer: WebGL viewer equipped with a measurement grid for inspecting the generated mesh.

Local Development Setup

FORGE3D is containerized for simple deployment.

Prerequisites

Docker & Docker Compose installed.

Quick Start

Clone the repository.

Configure Environment Variables: Ensure you have .env set up with your database credentials, Redis URL, and your chosen LLM API keys (e.g., ANTHROPIC_API_KEY).

Build and Start the Containers:

# Start the Docker daemon if it's not running
sudo service docker start

# Build and start the services
docker compose up --build


If you need to rebuild after package changes:

docker compose stop app
docker compose build app
docker compose start app


Wait for ✓ Ready in your terminal logs.

Testing the API

Once the system is up, you can test the background job queue directly from the terminal.

Note: The following curl command tests the legacy/generic generation endpoint. The CAD-specific endpoints are under development.

curl -X POST http://localhost:3000/api/generate/text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a simple cube 50mm x 50mm x 50mm", "style": "realistic", "resolution": "draft"}'


(If you receive a "Failed to connect" error, verify the Docker containers have fully initialized and port 3000 is exposed).

Business & Startup Potential

FORGE3D targets a highly specific, underserved B2B niche. While most AI 3D tools target game developers or general artists with organic shapes, FORGE3D provides actual utility to mechanical engineers, industrial designers, and CAD specialists.

The "10x" Pitch: Converting a 2D technical drawing to a 3D CAD file manually takes a skilled engineer 2–4 hours. FORGE3D automates this step in under 30 seconds.

Portfolio Value: Demonstrates advanced full-stack capabilities including asynchronous architecture, Redis queuing, Docker orchestration, AI integration, and real-time polling.

Built for precision. Code to CAD.