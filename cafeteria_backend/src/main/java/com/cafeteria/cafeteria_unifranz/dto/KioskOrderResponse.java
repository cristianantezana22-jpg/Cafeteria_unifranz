package com.cafeteria.cafeteria_unifranz.dto;

public class KioskOrderResponse {
    private String status;
    private String ticketNumber;
    private String message;
    private Integer estimatedTimeMinutes;

    public KioskOrderResponse(String status, String ticketNumber, String message, Integer estimatedTimeMinutes) {
        this.status = status;
        this.ticketNumber = ticketNumber;
        this.message = message;
        this.estimatedTimeMinutes = estimatedTimeMinutes;
    }

    public String getStatus() { return status; }
    public String getTicketNumber() { return ticketNumber; }
    public String getMessage() { return message; }
    public Integer getEstimatedTimeMinutes() { return estimatedTimeMinutes; }
}