CREATE TABLE morse_messages (
    id UUID PRIMARY KEY,
    cipher_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NULL
);