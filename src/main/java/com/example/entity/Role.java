package com.example.entity;

public enum Role {
    ADMIN("Admin"),
    MANAGER("Manager"),
    EMPLOYEE("Employee"),
    SUPPLIER("Supplier");

    private final String displayName;

    Role(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
