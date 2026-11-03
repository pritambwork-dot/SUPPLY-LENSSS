from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    GEOAPIFY_API_KEY: str = ""
    NIMBLEWAY_API_KEY: str = ""
    APIFY_API_KEY: str = ""
    GROK_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    CODERABBIT_API_KEY: str = ""
    API_KEY_21ST: str = ""
    DATABASE_URL: str = "postgresql://supplylens:supplylens@localhost:5432/supplylens"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
