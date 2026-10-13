# Autonomous Discovery & Adaptive Planning Agent Skill

This package provides a production-grade Agent Skill designed to help AI Agents handle **completely new, novel, or unprecedented technical challenges** by combining **Tool-Augmented Research**, **PoC Sandboxing**, **Verbal Reflexion**, and **Plan-and-Solve (PS+) Prompting**.

---

## Package Contents

- `SKILL.md`: Full skill definition, system prompt template, protocol specification, and workflow guidelines.
- `README.md`: Integration guide and usage instructions across popular LLM/Agent frameworks.

---

## How to Install & Integrate

### 1. Cursor / Claude Desktop / Custom System Prompts
Copy the `<skill_definition>` block from `SKILL.md` directly into your system prompt or `.cursorrules` file.

### 2. LangChain / LangGraph
Load `SKILL.md` as a system prompt instruction or register it as a dynamic tool node in your state graph.

```python
from langchain_core.prompts import ChatPromptTemplate

with open("SKILL.md", "r") as f:
    skill_instructions = f.read()

prompt = ChatPromptTemplate.from_messages([
    ("system", f"You are an AI Agent equipped with the following skill:\n\n{skill_instructions}"),
    ("user", "{input}")
])
```

### 3. AutoGen / Multi-Agent Systems
Assign `SKILL.md` to a dedicated "Research & Discovery Agent" in a multi-agent hierarchy. This agent acts as a spike researcher before handing off verified specs to an "Execution Agent".

---

## Core Benefits

- **Prevents Hallucinations:** Stops agents from making wild guesses on unfamiliar APIs or libraries.
- **Self-Healing via Reflexion:** Agent analyzes runtime errors from PoC code and automatically adjusts its approach.
- **Safe Execution:** Keeps exploration strictly read-only until a verified execution plan is approved.
