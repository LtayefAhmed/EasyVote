package com.easyvote.backend.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, String field, Object value) {
        super(String.format("Resource [%s] not found with [%s]: [%s]", resource, field, value));
    }
}
