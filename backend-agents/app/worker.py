import os
import sys
from redis import Redis
from rq import Worker, Queue, Connection

listen = ["film_studio_jobs"]

redis_url = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")

def run_worker():
    conn = Redis.from_url(redis_url)
    with Connection(conn):
        worker = Worker(list(map(Queue, listen)))
        print(f"[Film Studio RQ Worker] Listening on queues {listen} at {redis_url}...")
        worker.work()

if __name__ == "__main__":
    run_worker()
