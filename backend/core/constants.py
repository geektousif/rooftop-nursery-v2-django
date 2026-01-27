from enum import Enum


class PermissionLevels:
    """Permission level constants"""

    READ_ONLY = "read_only"
    CAN_WRITE_OWN = "can_write_own"
    CAN_WRITE_ALL = "can_write_all"
    CAN_DELETE = "can_delete"

    ALL_LEVELS = {READ_ONLY, CAN_WRITE_OWN, CAN_WRITE_ALL, CAN_DELETE}


class Actions:
    """Action constants"""

    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"

    ALL_ACTIONS = {CREATE, READ, UPDATE, DELETE}


class UserRoles:
    """User role constants"""

    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    VENDOR = "vendor"
    CUSTOMER = "customer"
    ANON = "anonymous"

    ALL_ROLES = {SUPER_ADMIN, ADMIN, VENDOR, CUSTOMER, ANON}

    # Role hierarchy (higher roles inherit lower role permissions)
    HIERARCHY = {
        SUPER_ADMIN: {SUPER_ADMIN, ADMIN, VENDOR, CUSTOMER},
        ADMIN: {ADMIN, VENDOR, CUSTOMER},
        VENDOR: {VENDOR},
        CUSTOMER: {CUSTOMER},
        ANON: {ANON},
    }


class ApprovalStatusConstants(Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
