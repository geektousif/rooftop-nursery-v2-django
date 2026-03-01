from django.db import transaction

from shared.outbox.models import OutboxEvent


def publish_event(event_type: str, payload: dict):
    """
    Safe to call inside services.
    Event is committed atomically with DB transaction.
    """

    def _enqueue():
        OutboxEvent.objects.create(
            event_type=event_type,
            payload=payload,
        )

    transaction.on_commit(_enqueue)
