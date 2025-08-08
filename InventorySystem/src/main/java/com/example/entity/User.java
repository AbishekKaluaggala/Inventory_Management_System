package com.example.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "users")


public class User {
    @Id
    @Column(name = "userID")
    private String userId;


    @Column(name = "username", nullable = false)
    private String username;


    @Column(name = "password", nullable = false)
    private String password;


    @Column (name = "role", nullable = false)
    private String role;

    public User(){}

    public  User(String userID, String username, String password, String role){
        this.userId = userID;
        this.username = username;
        this.password = password;
        this.role = role;
    }

    public String getUserId() {return userId;}
    public void setUserId(String userId){this.userId = userId;}

    public String getUsername(){return username;}
    public void setUsername(String username){this.username = username;}

    public  String getPassword() {return password;}
    public void setPassword(String password) {this.password = password;}

    public String getRole() {return role;}
    public void setRole(String role) {this.role = role;}







}
