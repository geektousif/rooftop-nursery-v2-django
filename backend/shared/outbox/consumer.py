from celery import shared_task

from shared.outbox.models import OutboxEvent


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5)
def process_outbox_event(self, event_id: int):
    event = OutboxEvent.objects.get(id=event_id)

    if event.processed:
        return

    # TODO: route to handlers by event_type
    # dispatch(event.event_type, event.payload)

    event.processed = True
    event.save(update_fields=["processed"])
