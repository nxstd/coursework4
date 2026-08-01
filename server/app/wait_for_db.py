import time

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.database import engine

WAIT_TIMEOUT_SECONDS = 60
RETRY_INTERVAL_SECONDS = 2


def main() -> None:
    deadline = time.monotonic() + WAIT_TIMEOUT_SECONDS
    last_error: SQLAlchemyError | None = None

    while time.monotonic() < deadline:
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            print("Database is ready.")
            return
        except SQLAlchemyError as error:
            last_error = error
            time.sleep(RETRY_INTERVAL_SECONDS)

    raise RuntimeError(
        f"Database did not become ready within {WAIT_TIMEOUT_SECONDS} seconds "
        f"for {settings.database_url.split('@')[-1]}"
    ) from last_error


if __name__ == "__main__":
    main()
