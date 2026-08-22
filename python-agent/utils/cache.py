import time
from typing import Any, Optional

class SimpleCache:
    def __init__(self):
        self._store: dict = {}
        self.hits         = 0
        self.misses       = 0

    def get(self, key: str) -> Optional[Any]:
        if key not in self._store:
            self.misses += 1
            return None
        value, expires_at = self._store[key]
        if time.time() > expires_at:
            del self._store[key]
            self.misses += 1
            return None
        self.hits += 1
        return value

    def set(self, key: str, value: Any, ttl: int = 300):
        self._store[key] = (value, time.time() + ttl)

    def delete(self, key: str):
        self._store.pop(key, None)

    def delete_pattern(self, pattern: str):
        keys = [k for k in self._store if pattern in k]
        for k in keys:
            del self._store[k]

    @property
    def hit_rate(self) -> str:
        total = self.hits + self.misses
        return f"{(self.hits/total*100):.1f}%" if total > 0 else "0%"

    @property
    def size(self) -> int:
        return len(self._store)

# Global instance
cache = SimpleCache()