"""
Category selectors for read operations.

All selectors follow the style guide:
- Use select_related/prefetch_related for optimization
- Return QuerySets, not lists
- Filter in database, not Python
"""
from typing import Optional
from django.db.models import QuerySet, Prefetch

from apps.categories.models import Category


def category_get_all(*, is_active: Optional[bool] = None) -> QuerySet[Category]:
    """
    Get all categories with optional filtering.
    
    Args:
        is_active: Filter by active status (None = all)
    
    Returns:
        QuerySet of Category objects
    """
    qs = Category.objects.all()
    
    if is_active is not None:
        qs = qs.filter(is_active=is_active)
    
    return qs.order_by('_path')  # TreeNode ordering


def category_get_tree(*, root_only: bool = False) -> QuerySet[Category]:
    """
    Get category tree structure.
    
    Args:
        root_only: If True, return only root categories
    
    Returns:
        QuerySet of Category objects ordered by tree path
    """
    qs = Category.objects.filter(is_active=True)
    
    if root_only:
        qs = qs.filter(parent__isnull=True)
    
    return qs.order_by('_path')


def category_get_by_slug(*, slug: str) -> Category:
    """
    Get a single category by slug.
    
    Args:
        slug: Category slug
    
    Returns:
        Category instance
    
    Raises:
        Category.DoesNotExist: If category not found
    """
    return Category.objects.get(slug=slug, is_active=True)


def category_get_by_id(*, category_id: str) -> Category:
    """
    Get a single category by ID.
    
    Args:
        category_id: Category UUID
    
    Returns:
        Category instance
    
    Raises:
        Category.DoesNotExist: If category not found
    """
    return Category.objects.get(id=category_id)


def category_get_children(*, category_id: str) -> QuerySet[Category]:
    """
    Get direct children of a category.
    
    Args:
        category_id: Parent category UUID
    
    Returns:
        QuerySet of child Category objects
    """
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return Category.objects.none()
    
    return category.get_children().filter(is_active=True)


def category_get_descendants(*, category_id: str) -> QuerySet[Category]:
    """
    Get all descendants of a category.
    
    Args:
        category_id: Parent category UUID
    
    Returns:
        QuerySet of descendant Category objects
    """
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return Category.objects.none()
    
    return category.get_descendants().filter(is_active=True)


def category_get_ancestors(*, category_id: str) -> QuerySet[Category]:
    """
    Get all ancestors of a category (for breadcrumbs).
    
    Args:
        category_id: Category UUID
    
    Returns:
        QuerySet of ancestor Category objects (ordered root to parent)
    """
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return Category.objects.none()
    
    return category.get_ancestors().filter(is_active=True)
