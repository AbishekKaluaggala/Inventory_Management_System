package com.example.repository;

import com.example.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User,String> {
    Optional<User>findByUsername(String username);

    Optional<User>findByUsernameAndPassword(String username, String password);

    List<User>findByRole(String role);
}
