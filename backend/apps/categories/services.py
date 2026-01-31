"""
Category services for write operations.

All services follow the style guide:
- Keyword-only arguments with `*,`
- Type hints for all parameters
- Use @transaction.atomic for multi-table writes
- Return model instances, not dicts
- Raise custom exceptions for errors
"""
from typing import Optional
from uuid import UUID

from django.db import transaction
from django.utils.text import slugify

from apps.categories.models import Category


@transaction.atomic
def category_create(
    *,
    name: str,
    code: str,
    parent_id: Optional[UUID] = None,
    slug: Optional[str] = None,
    image_url: Optional[str] = None,
    is_active: bool = True,
) -> Category:
    """
    Create a new category.
    
    Args:
        name: Category name
        code: Unique category code
        parent_id: Optional parent category UUID
        slug: Optional slug (auto-generated from name if not provided)
        image_url: Optional image URL
        is_active: Whether category is active (default: True)
    
    Returns:
        Created Category instance
    
    Raises:
        ValueError: If code already exists or parent doesn't exist
    """
    # Generate slug from name if not provided
    if not slug:
        slug = slugify(name)
        # Ensure slug is unique
        base_slug = slug
        counter = 1
        while Category.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
    
    # Check code uniqueness
    if Category.objects.filter(code=code).exists():
        raise ValueError("Category with this code already exists")
    
    # Validate parent if provided
    parent = None
    if parent_id:
        try:
            parent = Category.objects.get(id=parent_id)
        except Category.DoesNotExist:
            raise ValueError("Parent category does not exist")
    
    category = Category.objects.create(
        name=name,
        slug=slug,
        code=code,
        parent=parent,
        image_url=image_url,
        is_active=is_active,
    )
    
    return category


@transaction.atomic
def category_update(
    *,
    category_id: UUID,
    name: Optional[str] = None,
    code: Optional[str] = None,
    parent_id: Optional[UUID] = None,
    slug: Optional[str] = None,
    image_url: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> Category:
    """
    Update an existing category.
    
    Args:
        category_id: Category UUID
        name: Optional new name
        code: Optional new code (must be unique)
        parent_id: Optional new parent category UUID
        slug: Optional new slug
        image_url: Optional new image URL
        is_active: Optional active status
    
    Returns:
        Updated Category instance
    
    Raises:
        Category.DoesNotExist: If category doesn't exist
        ValueError: If code already exists or parent doesn't exist
    """
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        raise Category.DoesNotExist("Category not found")
    
    # Update fields
    if name is not None:
        category.name = name
        # Update slug if name changed and slug not explicitly provided
        if slug is None:
            new_slug = slugify(name)
            if new_slug != category.slug:
                base_slug = new_slug
                counter = 1
                while Category.objects.filter(slug=new_slug).exclude(id=category_id).exists():
                    new_slug = f"{base_slug}-{counter}"
                    counter += 1
                category.slug = new_slug
    
    if slug is not None and slug != category.slug:
        # Ensure slug is unique
        base_slug = slug
        counter = 1
        while Category.objects.filter(slug=slug).exclude(id=category_id).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        category.slug = slug
    
    if code is not None and code != category.code:
        if Category.objects.filter(code=code).exclude(id=category_id).exists():
            raise ValueError("Category with this code already exists")
        category.code = code
    
    if parent_id is not None:
        if parent_id == category_id:
            raise ValueError("Category cannot be its own parent")
        try:
            parent = Category.objects.get(id=parent_id)
            category.parent = parent
        except Category.DoesNotExist:
            raise ValueError("Parent category does not exist")
    
    if image_url is not None:
        category.image_url = image_url
    
    if is_active is not None:
        category.is_active = is_active
    
    category.save()
    return category


@transaction.atomic
def category_delete(*, category_id: UUID) -> None:
    """
    Soft delete a category (sets is_active=False).
    
    Also deactivates all child categories.
    
    Args:
        category_id: Category UUID
    
    Raises:
        Category.DoesNotExist: If category doesn't exist
    """
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        raise Category.DoesNotExist("Category not found")
    
    # Soft delete: deactivate category and all children
    category.is_active = False
    category.save()
    
    # Deactivate all descendants
    descendants = category.get_descendants()
    Category.objects.filter(id__in=[d.id for d in descendants]).update(is_active=False)
