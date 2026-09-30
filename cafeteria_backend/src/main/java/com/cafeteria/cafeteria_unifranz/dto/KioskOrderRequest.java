package com.cafeteria.cafeteria_unifranz.dto;

import java.util.List;

public class KioskOrderRequest {
    private String block;
    private String paymentMethod;
    private List<OrderItemDto> items;

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }

    public static class OrderItemDto {
        private Long productId;
        private Integer quantity;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}