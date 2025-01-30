from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from openai import OpenAI
import logging
import re
import asyncio
import redis
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Redis
redis_client = redis.from_url(
    url=os.getenv('REDIS_URL'),
    decode_responses=True
)

client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
    default_headers={
        "OpenAI-Beta": "assistants=v2"
    }
)

ASSISTANT_ID = os.getenv('OPENAI_ASSISTANT_ID')

# Storage for tracking welcome bonus claims
WELCOME_BONUS_KEY = "welcome_bonus_claimed"
WALLET_BALANCE_PREFIX = "wallet_balance:"


class ConnectWallet(BaseModel):
    wallet_address: str


class PaymentVerification(BaseModel):
    wallet_address: str


class TokenUse(BaseModel):
    wallet_address: str
    amount: int


class ChatMessage(BaseModel):
    message: str
    thread_id: Optional[str] = None


def clean_text(text: str) -> str:
    pattern = r'【\d+:\d+†[^】]+】'
    return re.sub(pattern, '', text)


def get_wallet_key(wallet_address: str) -> str:
    return f"{WALLET_BALANCE_PREFIX}{wallet_address}"


@app.get("/api/balance/{wallet_address}")
async def get_balance(wallet_address: str):
    try:
        balance = redis_client.get(get_wallet_key(wallet_address))
        return {"balance": int(balance) if balance else 0}
    except redis.RedisError as e:
        logger.error(f"Redis error getting balance: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get balance")


@app.post("/api/connect")
async def connect_wallet(wallet: ConnectWallet):
    try:
        if not redis_client.sismember(WELCOME_BONUS_KEY, wallet.wallet_address):
            wallet_key = get_wallet_key(wallet.wallet_address)
            current_balance = int(redis_client.get(wallet_key) or 0)

            pipe = redis_client.pipeline()
            pipe.set(wallet_key, current_balance + 50)
            pipe.sadd(WELCOME_BONUS_KEY, wallet.wallet_address)
            pipe.execute()

            return {
                "success": True,
                "new_balance": current_balance + 50,
                "bonus_claimed": True
            }

        current_balance = int(redis_client.get(get_wallet_key(wallet.wallet_address)) or 0)
        return {
            "success": True,
            "new_balance": current_balance,
            "bonus_claimed": False
        }
    except redis.RedisError as e:
        logger.error(f"Redis error connecting wallet: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to connect wallet")


@app.post("/api/verify-payment")
async def verify_payment(payment: PaymentVerification):
    try:
        wallet_key = get_wallet_key(payment.wallet_address)
        current_balance = int(redis_client.get(wallet_key) or 0)
        new_balance = current_balance + 100
        redis_client.set(wallet_key, new_balance)

        return {
            "success": True,
            "new_balance": new_balance
        }
    except redis.RedisError as e:
        logger.error(f"Redis error verifying payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify payment")


@app.post("/api/use-tokens")
async def use_tokens(token_use: TokenUse):
    try:
        wallet_key = get_wallet_key(token_use.wallet_address)
        current_balance = int(redis_client.get(wallet_key) or 0)

        if current_balance < token_use.amount:
            raise HTTPException(status_code=400, detail="Insufficient tokens")

        new_balance = current_balance - token_use.amount
        redis_client.set(wallet_key, new_balance)

        return {
            "success": True,
            "new_balance": new_balance
        }
    except redis.RedisError as e:
        logger.error(f"Redis error using tokens: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to use tokens")


@app.post("/chat")
async def chat(message: ChatMessage):
    """Handle chat messages using OpenAI assistant."""
    try:
        if not message.message:
            raise HTTPException(status_code=400, detail="Message is required")

        if not message.thread_id:
            thread = client.beta.threads.create()
            thread_id = thread.id
        else:
            thread_id = message.thread_id

        client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=message.message
        )

        run = client.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=ASSISTANT_ID
        )

        while True:
            run = client.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run.id
            )
            if run.status == "completed":
                break
            elif run.status in ["failed", "cancelled", "expired"]:
                raise HTTPException(status_code=500, detail=f"Chat run failed with status: {run.status}")
            await asyncio.sleep(1)

        messages = client.beta.threads.messages.list(thread_id=thread_id)
        assistant_message = next(msg for msg in messages if msg.role == "assistant")
        response_text = clean_text(assistant_message.content[0].text.value)

        return {
            "response": response_text,
            "thread_id": thread_id
        }

    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, workers=4)