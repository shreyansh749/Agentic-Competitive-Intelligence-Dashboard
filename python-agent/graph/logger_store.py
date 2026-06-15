# graph/logger_store.py
# Single Source of Truth for shared background execution threads

active_agent_logs: dict[str, list] = {}
active_agent_status: dict[str, str] = {}