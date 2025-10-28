package com.cts.booking_service.exception;

import com.cts.booking_service.dto.ApiErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;
    private WebRequest webRequest;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/test");
        webRequest = new ServletWebRequest(request);
    }

    @Test
    void shouldHandleResourceNotFoundException() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Resource not found");

        ResponseEntity<ApiErrorResponse> response = exceptionHandler.handleResourceNotFoundException(exception, webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().getMessage()).isEqualTo("Resource not found");
        assertThat(response.getBody().getStatus()).isEqualTo(404);
    }

    @Test
    void shouldHandleUnAuthorizedException() {
        UnAuthorizedException exception = new UnAuthorizedException("Unauthorized access");

        ResponseEntity<ApiErrorResponse> response = exceptionHandler.handleUnAuthorizedException(exception, webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().getMessage()).isEqualTo("Unauthorized access");
        assertThat(response.getBody().getStatus()).isEqualTo(403);
    }

    @Test
    void shouldHandleIllegalArgumentException() {
        IllegalArgumentException exception = new IllegalArgumentException("Invalid argument");

        ResponseEntity<ApiErrorResponse> response = exceptionHandler.handleIllegalArgumentException(exception, webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getMessage()).isEqualTo("Invalid argument");
        assertThat(response.getBody().getStatus()).isEqualTo(400);
    }

    @Test
    void shouldHandleGlobalException() {
        Exception exception = new RuntimeException("Unexpected error");

        ResponseEntity<ApiErrorResponse> response = exceptionHandler.handleGlobalException(exception, webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().getMessage()).contains("unexpected internal error");
        assertThat(response.getBody().getStatus()).isEqualTo(500);
    }
}