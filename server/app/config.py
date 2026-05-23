from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./dev.db"
    client_origin: str = "http://localhost:3000"
    port: int = 4000

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

