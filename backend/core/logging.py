import logging

logger = logging.getLogger(__name__)


class AuditLogMixin:
    """
    Mixin to log sensitive operations.
    Add to viewsets that perform critical actions.
    """

    def perform_create(self, serializer):
        instance = serializer.save()
        logger.info(
            f"CREATE: {self.request.user.email} created "
            f"{instance.__class__.__name__} {instance.id}"
        )
        return instance

    def perform_update(self, serializer):
        instance = serializer.save()
        logger.info(
            f"UPDATE: {self.request.user.email} updated "
            f"{instance.__class__.__name__} {instance.id}"
        )
        return instance

    def perform_destroy(self, instance):
        logger.warning(
            f"DELETE: {self.request.user.email} deleted "
            f"{instance.__class__.__name__} {instance.id}"
        )
        instance.delete()
