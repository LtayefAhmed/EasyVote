package com.easyvote.backend.exception;

public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String resource, String field, Object value) {
        super(String.format("%s with %s [%s] already exists", resource, field, value));
    }
}
