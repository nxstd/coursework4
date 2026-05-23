from app.database import create_db_and_tables


def main() -> None:
    create_db_and_tables()
    print("Database schema is ready.")


if __name__ == "__main__":
    main()

