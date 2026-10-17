package com.cafeteria.cafeteria_unifranz.Infraestructure.Web.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
<<<<<<< HEAD

import com.cafeteria.cafeteria_unifranz.Domain.InvalidCredentialsException;
import com.cafeteria.cafeteria_unifranz.Domain.EmailAlreadyRegisteredException;
import com.cafeteria.cafeteria_unifranz.Domain.RoleNotAllowedException;
=======
import org.springframework.web.server.ResponseStatusException;

import com.cafeteria.cafeteria_unifranz.Domain.InvalidCredentialsException;
import com.cafeteria.cafeteria_unifranz.Domain.RoleNotAllowedException;
import com.cafeteria.cafeteria_unifranz.Domain.CajeroSinBloqueException;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoAlmuerzoRestringidoException;
import com.cafeteria.cafeteria_unifranz.Domain.PedidoNoEncontradoException;
import com.cafeteria.cafeteria_unifranz.Domain.TransicionEstadoInvalidaException;
>>>>>>> alan
import com.cafeteria.cafeteria_unifranz.application.dto.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

<<<<<<< HEAD
    @ExceptionHandler(EmailAlreadyRegisteredException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyRegistered(EmailAlreadyRegisteredException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(ex.getMessage()));
    }

=======
>>>>>>> alan
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(RoleNotAllowedException.class)
    public ResponseEntity<ErrorResponse> handleRoleNotAllowed(RoleNotAllowedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(ex.getMessage()));
    }

<<<<<<< HEAD
=======
    @ExceptionHandler(PedidoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handlePedidoNoEncontrado(PedidoNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(TransicionEstadoInvalidaException.class)
    public ResponseEntity<ErrorResponse> handleTransicionInvalida(TransicionEstadoInvalidaException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler({PedidoAlmuerzoRestringidoException.class, CajeroSinBloqueException.class})
    public ResponseEntity<ErrorResponse> handleCajaSinPermiso(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(ex.getMessage()));
    }

>>>>>>> alan
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("Datos inválidos.");
        return ResponseEntity.badRequest().body(new ErrorResponse(message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponse("La solicitud no es válida."));
    }
<<<<<<< HEAD
=======

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(new ErrorResponse(ex.getReason() == null ? "La solicitud no pudo completarse." : ex.getReason()));
    }
>>>>>>> alan
}
