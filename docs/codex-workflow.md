# Running the game workflow in Codex

Keep SOUL.md, AGENTS.md and AGENT_INDEX.md as the shared rules. CLAUDE.md still imports AGENTS.md; the existing Claude setup is unchanged.

For the Many, Many Monkeys desk POC, the parent model plans and integrates. Substitute available `gpt-6.1-terra` workers for the Claude Haiku role. This is a role substitution, not a price/performance equivalence. Dispatch bounded issues with explicit ownership and frozen interfaces, using fresh context (`fork_turns: none`) whenever possible. This environment supports three simultaneous workers plus the parent.

Use the existing decompose skill's issue format and prompts/worker.md. Workers do not commit or open PRs. Parent runs the complete build and browser smoke after each epic; unit tests do not prove the UI works. On Windows use npm.cmd and the repository's Git Bash smoke script. If the sandbox blocks npm symlinks, a browser process or loopback, request the necessary execution approval instead of changing game logic to accommodate the sandbox.

The executed issue shapes and adaptations are in [the desk roadmap](roadmaps/many-many-monkeys.md). Later management systems require new issues and explicit contracts. Never copy the separate Unity or historical browser runtime into this workspace.
