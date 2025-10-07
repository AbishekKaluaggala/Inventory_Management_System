package com.example.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "users")


public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "userID")
    private String userId;


    @Column(name = "username", nullable = false)
    private String username;


    @Column(name = "password", nullable = false)
    private String password;


    @Enumerated(EnumType.STRING)
    @Column (name = "role", nullable = false)
    private Role role;


    @Column(name = "isActive ", nullable = false)
    private boolean isActive = true;

    public User(){}

    public  User(String userID, String username, String password, Role role){
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

    public Role getRole(){return role;}
    public void setRole(Role role){this.role = role;}

    public boolean isActive(){return isActive;}
    public void setActive(boolean active){isActive = active;}







}
