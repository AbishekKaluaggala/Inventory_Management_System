package com.example.service;

import com.example.entity.User;
import com.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User saveUser(User user){
        return userRepository.save(user);
    }

    public List<User>getAllUsers(){
        return userRepository.findAll();
    }

    public Optional<User>getUserById(String userId){
        return userRepository.findById(userId);
    }

    public User login(String username, String password){
        Optional<User> user = userRepository.findByUsernameAndPassword(username,password);
        return user.orElse(null);
    }

    public void deleteUser(String userId){
        userRepository.deleteById(userId);
    }

    public List<User>getUserByRole(String role){
        return userRepository.findByRole(role);
    }
}
