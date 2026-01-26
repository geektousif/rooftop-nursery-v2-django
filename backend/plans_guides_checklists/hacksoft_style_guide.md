### Follows HackSoftware's [Django Styleguide](https://github.com/HackSoftware/Django-Styleguide)

## Principles and Practices
 - **Business Logic belongs in Services and Selectors**
    - Logics that write the DB -> Services
    - Logics that read the DB -> Selectors

    - Services/Selectors -> Functions/Classes
    - It’s decoupled from the interface.
    
    - This function handles all the messy bits of any business logic: validation, saving, and triggering follow-ups. It doesn’t care if the caller is an API view, a Celery task, or a management command.

## Naming Conventions
 - **For Selectors and Services**
    - `<entity>_<action>`
    - example: `user_create`, `payment_charge`, `email_send`

## Keep Models Lean yet Validated
    - models should store data, not dictate behavior.
    - Simple validations go in `clean()` / `full_clean()`
    - Common fields like `created_at` / `updated_at` belong in a `BaseModel`
    - Simple @property .. but if they are complex, move them

    - Use constraints here, if you can express a rule at the DB level, do it.
        - Meta
        - Check constraints

        - with Django 4.1+, calling .full_clean() will even check those constraints before hitting the DB. So yeah — go for it.

    ### Properties vs Selectors
    **A good rule of thumb:**
        - If it touches relations or risks N+1s — make it a selector.
        - If it’s simple math on local fields — property is fine.

    - Methods here, Only if they’re dumb.
        - Accepts an argument. No DB calls. No side-effects. Totally fine.
        - But if a method needs to pull in 3 related models and hit Stripe? That’s a job for your service layer — not your model.


## APIs Are Interface, Not Logic Hubs
    - A common anti-pattern in Django:
    - **Stuffing your entire business logic into views and serializers.**

    - What **should not** do:
        - ❌ View in -> permissions, parsing, updates, and side effects
        - ❌ Serializer -> validating cross-model logic
        - ❌ Sign of problems -> Debugging anything takes 5 layers of indirection

    - **APIs don’t do logic—they just call logic.**
    > “One API = One action. No magic. Just call a service and return a response.”

    * No model calls. No business logic. Just:
        * Validate input
        * Call service
        * Return status

    ### **Input & Output serializers are split**
        - **Input** -> Validation (validate what comes in)
        - **Output** -> Presentation (serialize what goes out)

    - **Pagination? Filters? Nesting? Still works.**
        - Filters go in the API’s FilterSerializer
        - Pagination uses a helper (get_paginated_response)
        - Heavy nested output? Use inline_serializer or move to a custom serialization function

    
    - **Avoid generic views**
        - Instead, start with APIView or GenericAPIView, and build your own pattern.
        - Want to reuse logic? Use mixins. 
        - Want clarity? Use classes for namespacing. 
        - Want to avoid decorator hell? Stick to CBVs.

    - **Fetching objects? Be explicit.** 
        -> use a simple get_object() util wrapping get_object_or_404()
        -> Pass a model or queryset and kwargs. Returns an Object or none.

        _serializer-side fetching is a black box. If you need user.profile — go get it and pass it to the service. No magic lookups inside your serializers._


## Tests That Match the Architecture
    - If your logic lives in services → test services
    - If your reads live in selectors → test selectors
    - If your APIs are thin → test that they connect the dots, not the dots themselves

    **Services are the main testing target**
    
    - Write clean, focused unit tests around your service functions. Pass them arguments, assert results, and mock external systems (like Celery, emails, or third-party APIs).

    **APIs? Just verify integration.**
    - keep _test views_ light:
        - Ensure they call the right service
        - Check basic auth/permissions
        - Assert the response shape


## Async Tasks, Error Handling & Config That Don’t Suck
    - Biggest mistake in async Django: putting real logic inside the Celery task.
    - The task is just an entry point. The real work happens in services.
    - Side-effects? Wrap them in on_commit()
        - If your task depends on something being saved in the DB, don’t queue it before the transaction finishes.

    - **Custom exception handler**
        - Unifies all errors under a {"message": "...", "extra": {}} format
        - Supports DRF and Django ValidationError
        - Plays nice with 404s, 403s, and custom app exceptions

        ```python
        {
            "message": "Validation error",
            "extra": {
                "fields": {
                "email": ["This field is required."]
                }
            }
        }
        ```

    **Split Django settings like this:**
    ```markdown
        config/
        ├── django/
        │   ├── base.py
        │   ├── production.py
        │   ├── test.py
        │   └── local.py
        ├── settings/
        │   ├── celery.py
        │   ├── sentry.py
        │   └── cors.py
    ```