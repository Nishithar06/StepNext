"""
FastAPI Authentication & JWT Verification Module for StepNext.
Verifies Supabase Auth JWT tokens passed in Authorization Bearer headers
and enforces ownership rules across all user endpoints.
"""

from typing import Optional
from fastapi import Header, HTTPException, status
from app.config import get_supabase_client

def verify_jwt_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    FastAPI Header dependency.
    Extracts Bearer token from Authorization header and verifies it via Supabase Auth.
    - If Supabase client is available (production mode):
        - Missing or invalid token -> Raises HTTP 401 Unauthorized.
        - Valid token -> Returns authenticated Supabase user ID (UUID).
    - If Supabase client is not available (local fallback mode):
        - Returns None (allowing offline local development).
    """
    client = get_supabase_client()
    if not client:
        # Local development / offline fallback mode
        return None

    if not authorization or not authorization.startswith("Bearer "):
        print("[Auth Warning] Missing or malformed Authorization Bearer header in production mode.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header. Authentication required.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = authorization.split("Bearer ")[1].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Empty Authorization token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        # Verify token using Supabase Auth
        res = client.auth.get_user(token)
        user_obj = getattr(res, 'user', None) or (res.get('user') if isinstance(res, dict) else None)
        
        if user_obj:
            user_id = getattr(user_obj, 'id', None) or (user_obj.get('id') if isinstance(user_obj, dict) else None)
            if user_id:
                print(f"[Auth] JWT_VERIFIED: auth_user_id={user_id}")
                return user_id

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Supabase Auth token.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Auth Error] Supabase JWT verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )

def verify_user_ownership(requested_user_id: str, authenticated_user_id: Optional[str]) -> str:
    """
    Security Guard:
    Enforces that an authenticated user can ONLY query or modify their own data.
    If authenticated_user_id is set (production mode), requested_user_id MUST match authenticated_user_id.
    Prevents User A from passing user_id=User_B to access User B's profile/check-ins.
    """
    if isinstance(authenticated_user_id, str) and authenticated_user_id:
        if requested_user_id != authenticated_user_id:
            print(f"[Security Alert] Ownership mismatch: auth_id='{authenticated_user_id}' requested_id='{requested_user_id}'")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You are not authorized to access or modify data for another user."
            )
        return authenticated_user_id
    return requested_user_id
