import hashlib

from django.db import IntegrityError, transaction

from shared.idempotency.models import IdempotencyKey


def _hash_response(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


@transaction.atomic
def check_and_store(key: str, response_body: bytes):
    """
    Enforces idempotency.
    Raises ValueError if key already used.
    """
    response_hash = _hash_response(response_body)

    try:
        IdempotencyKey.objects.create(
            key=key,
            response_hash=response_hash,
        )
    except IntegrityError:
        raise ValueError("Duplicate idempotency key")
